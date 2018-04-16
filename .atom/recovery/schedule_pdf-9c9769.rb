class SchedulePdf < Prawn::Document
  include ScheduleComponents

  # attr_reader :schedule, :club, :params, :categories

  def initialize(schedule, club, params = {})

    @club = club
    @schedule = schedule
    @params = params

    set_categories
    set_occurrences
    set_orientation
    super(top_margin: 70, page_layout: @orientation)

    register_fonts
    page_one
    page_two
  end

  def register_fonts
    font_families.update(
      "Interstate" => {
        normal: { file: "#{Rails.root}/public/fonts/interstate/656c1288-e1ff-44de-ad5d-de03c2e608f4.ttf" },
        bold: { file: "#{Rails.root}/public/fonts/interstate/2bca32fb-468f-4060-8c61-a17f394cb1d6.ttf" },
        light: { file: "#{Rails.root}/public/fonts/interstate/Interstate-LightCondensed.ttf" }
      })
    font_families.update(
      "Arial" => {
        normal: { file: "#{Rails.root}/public/fonts/arial/arialn.ttf" }
      })
  end

  def page_one
    logo
    category_type
    club_name
    schedule_name
    class_key
    gray_days
    header_line_days
    day_night_icons
    days_classes
  end

  def page_two
    start_new_page(:layout => :landscape)
    logo
    description_title
    description_club_name
    description_address_phone
    description_hours
    description_special_hours
    description_fine_print
    descriptions_lines_gray
    class_descriptions
  end

  private
  def is_schedule
    @params[:button_location] == 'schedule'
  end

  def set_categories
    @categories = @params[:options] == "small" ?
      ["Small Group Training"] :
      ["Action Sports", "Cardio & Dance", "Chisel It", "Mind Body Burn", "Something Different", "The Ride"]
  end

  def set_orientation
    @orientation = find_schedule_count[0] > 8 || find_schedule_count[1] > 12 ? :portrait : :landscape
  end

  def set_occurrences
    occurrences = is_schedule ?
      @schedule.occurrences.active : #schedules -> occurrences
      @schedule.by_schedule_template #schedule_templates -> occurrence_templates

    @occurrences = occurrences.select { |o| @categories.include? o.program.category.name }
  end

  def time_of_day(start_time)
    hour = start_time.strftime('%H').to_i
    minute = start_time.strftime('%M').to_i
    if hour < 12
      "morning"
    elsif (12..14).include?(hour) || hour == 15 && minute <= 30
      "midday"
    else
      "evening"
    end
  end

  def find_schedule_count

    # morning = []
    # evening = []
    #
    # days = Array.new(7, {day_of_week: nil, time_of_day: nil})
    #
    # if @occurrences.present?
    #   @occurrences.each_with_index.inject({}) do |acc, occurrence, index|
    #     struct = {}
    #     struct[:day_of_week] = occurrence.day_of_week
    #     struct[:time_of_day] = time_of_day(occurrence.local_start_time)
    #
    #     days[index] = struct
    #   end
    #   sorted = days.group_by { |hash| hash[:day_of_week] }
    #
    #   7.times do |index|
    #     if sorted[index + 1].present?
    #       if sorted[index + 1].group_by { |hash| hash[:time_of_day] }["morning"].present?
    #         morning << sorted[index + 1].group_by { |hash| hash[:time_of_day] }["morning"].count
    #       else
    #         morning << 0
    #       end
    #       if sorted[index + 1].group_by { |hash| hash[:time_of_day] }["evening"].present?
    #         evening << sorted[index + 1].group_by { |hash| hash[:time_of_day] }["evening"].count
    #       else
    #         evening << 0
    #       end
    #     end
    #   end
    # else
    #   morning = [0]
    #   evening = [0]
    # end
    # [morning.max, evening.max] #[4,3,1,1,5,6,8]
  end
end
