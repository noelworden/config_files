# frozen_string_literal: true

# SchedulePdf args  -> (params)

class PdfController < ApplicationController
  def week_schedule
    #setting variables based on where schedule is being accessed (button_location)
    is_schedule = params[:button_location] == "schedule"
    schedule = is_schedule ? Schedule.find(params[:schedule]) : nil

    if is_schedule
      schedule_template = nil
      @occurrences = schedule.occurrences.includes(occurrence_program: :studio, program: :category).active
      club = Club.find(schedule.club_id)
    elsif is_schedule == false && params[:schedule_template].present?
      schedule_template = ScheduleTemplate.find(params[:schedule_template])
      @occurrences = OccurrenceTemplate.by_schedule_template_id(schedule_template.id)
    else
      schedule_template = ScheduleTemplate.find_by(club_id: params[:club_id], default: true)
      @occurrences = OccurrenceTemplate.by_schedule_template_id(schedule_template.id)
    end

    club = is_schedule ? Club.find(schedule.club_id) : Club.find(schedule_template.club_id)
    date = params[:button_location]== "schedule" ? Date.commercial(schedule.year, schedule.week).strftime('%Y%m%d') : nil
    class_type = params[:options] == "group" ? "gf" : "sgt"

    categories = params[:options] == "small" ?
    ["Small Group Training"] :
    ["Action Sports", "Cardio & Dance", "Chisel It", "Mind Body Burn", "Something Different", "The Ride"]

    @occurrences = @occurrences.select { |o| categories.include? o.program.category.name }

    #setting schedule to portrait or landscape, depending on how many classes exist in morning and evening
    orientation = find_schedule_count[0] > 8 || find_schedule_count[1] > 12 ? :portrait : :landscape

    respond_to do |format|
      filename = is_schedule ? "#{club.name}_#{class_type}_classes_week_of_#{date}.pdf" : "#{club.name}_#{class_type}_classes_#{schedule_template.name}.pdf"
      format.pdf do
        pdf = SchedulePdf.new(
          @occurrences,
          params[:button_location], club, params[:options],
          schedule, schedule_template, orientation
        )
        send_data pdf.render,
                  filename: filename,
                  type: 'application/pdf',
                  disposition: 'inline'
      end
    end
  end

  private

  def time_of_day(start_time)
    time = start_time.strftime('%H').to_i
    if time < 12
      "morning"
    elsif time >= 12 && time < 17
      "midday"
    else
      "evening"
    end
  end

  def find_schedule_count
    morning = []
    evening = []

    days = Array.new(7, {day_of_week: nil, time_of_day: nil})

    if @occurrences.present?
      @occurrences.each_with_index do |occurrence, index|
        struct = {}
        struct[:day_of_week] = occurrence.day_of_week
        struct[:time_of_day] = time_of_day(occurrence.local_start_time)

        days[index] = struct
      end
      sorted = days.group_by { |hash| hash[:day_of_week] }

      7.times do |index|
        if sorted[index + 1].present?
          if sorted[index + 1].group_by { |hash| hash[:time_of_day] }["morning"].present?
            morning << sorted[index + 1].group_by { |hash| hash[:time_of_day] }["morning"].count
          else
            morning << 0
          end
          if sorted[index + 1].group_by { |hash| hash[:time_of_day] }["evening"].present?
            evening << sorted[index + 1].group_by { |hash| hash[:time_of_day] }["evening"].count
          else
            evening << 0
          end
        end
      end
    else
      morning = [0]
      evening = [0]
    end
    [morning.max, evening.max]
  end
end
