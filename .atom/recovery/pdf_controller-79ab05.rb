# frozen_string_literal: true

# SchedulePdf args  -> (params)

class PdfController < ApplicationController
  def week_schedule
    #setting variables based on where schedule is being accessed (button_location)
    is_schedule = params[:button_location] == "schedule"
    class_type = params[:options] == "group" ? "gf" : "sgt"

    # schedule = is_schedule ? Schedule.find(params[:schedule]) : nil

    if is_schedule
      schedule = Schedule.find(params[:schedule]).includes(occurrences: [occurrence_program: :studio, program: :category])
      club = Club.find(schedule.club_id)
      filename = "#{club.name}_#{class_type}_classes_week_of_#{Date.commercial(schedule.year, schedule.week).strftime('%Y%m%d')}.pdf"
      # @occurrences = schedule.occurrences.includes(occurrence_program: :studio, program: :category).active
    else
      search_options = params[:schedule_template].present? ? { id: params[:schedule_template] } : { club_id: params[:club_id], default: true }
        # @occurrences = OccurrenceTemplate.by_schedule_template_id(schedule_template.id)
      schedule = ScheduleTemplate.find_by(search_options).includes(:occurence_templates)
      club = Club.find(schedule_template.club_id)
      filename = "#{club.name}_#{class_type}_classes_#{schedule_template.name}.pdf"
    end

    categories = params[:options] == "small" ?
    ["Small Group Training"] :
    ["Action Sports", "Cardio & Dance", "Chisel It", "Mind Body Burn", "Something Different", "The Ride"]

    @occurrences = @occurrences.select { |o| categories.include? o.program.category.name }

    #setting schedule to portrait or landscape, depending on how many classes exist in morning and evening
    orientation = find_schedule_count[0] > 8 || find_schedule_count[1] > 12 ? :portrait : :landscape

    respond_to do |format|
      # filename = is_schedule ? "#{club.name}_#{class_type}_classes_week_of_#{date}.pdf" : "#{club.name}_#{class_type}_classes_#{schedule_template.name}.pdf"
      format.pdf do
        pdf = SchedulePdf.new(schedule, club, params)
        #   @occurrences,
        #   params[:button_location], club, params[:options],
        #   schedule, schedule_template, orientation
        # )
        send_data pdf.render,
                  filename: filename,
                  type: 'application/pdf',
                  disposition: 'inline'
      end
    end
  end
end
