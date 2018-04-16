// ==================================================================================================
//
// Career Tabs
//
// ==================================================================================================
require('chosen-npm/public/chosen.jquery.js');
import { _ }  from 'lodash';
import { throttle }  from '../utilities/savnac';

const DEP_ENDPOINT = 'https://api.greenhouse.io/v1/boards/dataminr/embed/departments'
const OFFICES_ENDPOINT = 'https://api.greenhouse.io/v1/boards/dataminr/embed/offices'
const JOBS_ENDPOINT = 'https://api.greenhouse.io/v1/boards/dataminr/embed/jobs'

const getCareerInfo = () => {
  const search = window.location.search.substr(1)

  // Default filter options
  let params = {
    location: 'New York',
    field: 'All'
  }

  if (search.length > 0) {
    search.split('&').forEach(p => {
      const splitted = p.split('=')
      params[splitted[0]] = splitted[1].replace(/(%20)/g, ' ')
    })
  }

  let props = {
    isEnabled : false,
    departments : {
      // departmentName: {
      //   jobTitle: [{
      //     locations: [],
      //     url: ''
      //   }],
      //   }
      // }
    },
    locationFilter: params.location,
    departmentFilter: params.field
  };

  const formatLocationName = (input) => {
    const options = {
      Bozeman: 'Bozeman',
      DC: 'Washington DC',
      'Washington DC': 'Washington DC',
      London: 'London',
      'New York': 'New York',
      NYC: 'New York',
      Seattle: 'Seattle',
      Dublin: 'Dublin'
    };

    return options[input];
  }

  // List locations to be used in dropdown filter
  const locationOptions = ["New York", "London", "Seattle", "Bozeman", "Washington DC", "Dublin"];

  let els = {};

  // Cache dom element selectors
  // ------------------------------------------------
  const createChildren = () => {
    els.$jobsContainer    = $('.js-jobs');
    els.$jobsWrapper      = els.$jobsContainer.parent();
    els.$departmentSelect = $('.js-select-department');
    els.$locationSelect   = $('.js-select-location');
    els.$locationList     = $('.js-location-list');
    els.$noJobs           = $('.js-no-jobs');
    els.numJobs           = 0;
  }

  // Set changing vars
  // ------------------------------------------------
  const setChangingVars = () => {
    els.$jobsWrapper.css('height', '');

    setTimeout(() => {
      let containerHeight = (els.numJobs === 0)
        ? 310
        : els.$jobsContainer.outerHeight();

      els.$jobsWrapper.css('height', containerHeight + 'px');
    }, 10);
  }

  // On location list click (md & up), filter jobs
  // ------------------------------------------------
  const onLocationClick = (e) => {
    props.locationFilter = e.currentTarget.innerHTML;

    $('.job-locations__item').removeClass('is-active');
    $(e.currentTarget).addClass('is-active');

    renderJobsMarkup();
  }

  // On location selection change (mobile), filter jobs
  // ------------------------------------------------
  const onLocationSelectChange = (e) => {
    props.locationFilter = e.currentTarget.value;
    renderJobsMarkup();
  }

  // On department selection change, filter jobs
  // ------------------------------------------------
  const onDepartmentSelectChange = (e) => {
    props.departmentFilter = e.currentTarget.value;
    renderJobsMarkup();
  }

  // HTML template for each job
  // ------------------------------------------------
  const jobTemplate = _.template('\
    <div class="job">\
      <div class="job__title-loc">\
        <p class="type--inline-block type--d7 type--blue-bright"><%- field %></p>\
        <span class="type--grey-medium type--e7"> / </span>\
        <p class="type--inline type--d7 type--mixed type--grey-medium"><%- location %></p>\
      </div>\
      <div class="job__link">\
        <a href="<%- url %>" target="_blank" class="link-blue">\
          <span class="type--e3 type--blue-dark icon-arrow-after"><%- jobTitle %></span>\
          <i class="icon icon--after icon-global-link-arrow type--blue-bright is-visible-mobile--inline-block"></i>\
        </a>\
      </div>\
    </div>\
  ')

  const generateOption = (text) => {
    return text === props.departmentFilter ? `<option selected>${text}</option>` : `<option>${text}</option>`
  }

  // Create <select> options for departments that have jobs
  // ------------------------------------------------
  const createDepartmentOptions = () => {
    debugger
    els.$departmentSelect.empty().append($(generateOption('All')));

    // for each department, generate a select option
    for (let d in props.departments) {
      if ({}.hasOwnProperty.call(props.departments, d)) {
        let opt = $(generateOption(d));
        els.$departmentSelect.append(opt);
        // debugger
      }
    }

    // Init chosen on the select
    els.$departmentSelect.chosen({
      disable_search: true,
      width: '100%'
    });

    // Listen for change event to re-filter jobs
    els.$departmentSelect.on('change', onDepartmentSelectChange);
  }

  // Create <select> options for all locations
  // ------------------------------------------------
  const createLocationOptions = () => {
    els.$locationList.empty(); // resets in case of back button press
    const locations = ['All', ...locationOptions]; // Adds 'all' option to locations array

    // For each location, append both an option in a mobile visible <select> for it
    // and a list item for it for desktop
    locations.forEach(loc => {
      els.$locationSelect.append($(`<option>${loc}</option>`));
      els.$locationList.append(`<button type="button" class="job-locations__item type--d5 type--grey-medium--60">${loc}</button>`);
    });

    // Set select to locationFilter value
    els.$locationSelect.val(props.locationFilter);

    // Set active location list
    $(".job-locations__item:contains('" + props.locationFilter + "')").addClass('is-active');

    // Init chosen on the select
    els.$locationSelect.chosen({
      disable_search: true,
      width: '100%'
    });

    // Listen for click & change events to re-filter jobs
    els.$locationList.children().on('click', onLocationClick);
    els.$locationSelect.on('change', onLocationSelectChange);
  }

  // Store data from JSON, create all filters and initial markup
  // ------------------------------------------------
  const setUpData = (data) => {
    // debugger
    // loop through each office
    data.offices.forEach((l, i) => {
      if (l.name === 'No Office') return;

      // for each department inside each office
      l.departments.forEach(d => {
        if (d.name === 'No Department' || d.jobs.length === 0 ) return;
        // if (d.name === 'No Department' || (d.jobs.length === 0 && d.child_ids.length === 0) || d.parent_id != null) return;
        // if (d.parent_id != null) {
        //   debugger
        // }
        props.departments[d.name] = props.departments[d.name] || {}

        if (d.parent_id != null) {
          props.excludeDropdown[d.name] = props.excludeDropdown[d.name] || {}
        }
        // for each job inside each department
        d.jobs.forEach(j => {
          // if (j.internal_job_id === 717403) {
          //   debugger
          // }
          props.departments[d.name][j.title] = props.departments[d.name][j.title] || []
          // debugger
          const existing = _.find(props.departments[d.name][j.title], i => i.absolute_url === j.absolute_url)

          if (!existing) {
            props.departments[d.name][j.title].push({
              locations: [l.name],
              absolute_url: j.absolute_url
            })
          } else {
            existing.locations.push(l.name)
          }
        })
      })
    });

    createDepartmentOptions();
    debugger
    createLocationOptions();
    renderJobsMarkup();
  }

  // Render markup for the jobs based on current filters
  // ------------------------------------------------
  const renderJobsMarkup = () => {
    const {departmentFilter, locationFilter, departments} = props; // descoping global props

    els.$noJobs.fadeOut(100);
    els.$jobsWrapper.addClass('is-transparent');
    els.$jobsContainer.addClass('is-faded-out');

    setTimeout(() => {
      els.$jobsContainer.empty();

      for (let d in departments) {
        if (departmentFilter !== 'All' && d !== departmentFilter) continue;

        for (let title in departments[d]) {
          if ({}.hasOwnProperty.call(departments[d], title)) {

            departments[d][title].forEach(j => {
              let inLocation = true

              if (locationFilter !== 'All') {
                inLocation = false

                j.locations.forEach(l => {
                  if (l === locationFilter) inLocation = true
                })
              }

              if (locationFilter !== 'All' && !inLocation) return

              const $jobMarkup = $(jobTemplate({
                field: d,
                location: j.locations.map(formatLocationName).join(', '),
                jobTitle: title,
                url: j.absolute_url
              }));

              els.$jobsContainer.append($jobMarkup);
            })

          }
        }
      }
    }, 300);

    els.$jobsContainer.removeClass('is-faded-out');
    setTimeout(() => {
      // Adds smooth height transition on change
      els.numJobs = $('.job').length;
      if(els.numJobs === 0) { els.$noJobs.fadeIn(100); }

      let containerHeight = (els.numJobs === 0)
        ? 310
        : els.$jobsContainer.outerHeight();

      els.$jobsWrapper.css('height', containerHeight + 'px');
      els.$jobsWrapper.removeClass('is-transparent');
    }, 300);
  }

  // Enable
  // ------------------------------------------------
  const enable = () => {
    if (props.isEnabled) return;

    props.departments = {}
    $.getJSON(OFFICES_ENDPOINT)
      .success(setUpData)

    props.resizeHandler = throttle(setChangingVars, 300);
    window.addEventListener('resize', props.resizeHandler);

    props.isEnabled = true;

    return;
  }

  // Disable
  // ------------------------------------------------
  const disable = () => {
    if (!props.isEnabled) return;

    // Remove your event handlers here
    els.$departmentSelect.off('change', onDepartmentSelectChange);
    els.$locationSelect.off('change', onLocationSelectChange);
    els.$locationList.children().off('click', onLocationClick);

    props.isEnabled = false;

    return;
  }

  // Init
  // ------------------------------------------------
  const init = () => {
    createChildren();
    enable();
    return;
  }

  return {
    init,
    enable,
    disable
  };
}

export default getCareerInfo;
