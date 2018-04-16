module ScheduleComponents
  include PrawnHelper
  include ActionView::Helpers::NumberHelper

  def logo
    location = @orientation == :landscape ? [-10, 557] : [-27, 740]

    image "#{Rails.root}/public/images/c_crunch-logo.png", at: location, width: 40
  end

  def category_type
    location = @orientation == :landscape ? [40, 552] : [23, 736]
    name = @categories == "small" ? "SMALL GROUP TRAINING" : "GROUP FITNESS"

    font_interstate
    text_box "#{name}", size: 16, at: location
  end

  def description_title
    font_interstate
    text_box "CLASS DESCRIPTIONS", size: 20, at: [40, 555]
  end

  def club_name
    if @orientation == :landscape && @categories == "small"
      location = [205, 552]
    elsif @orientation == :landscape && @categories != "small"
      location = [149, 552]
    elsif @orientation == :portrait && @categories == "small"
      location = [187, 736]
    else
      location = [132, 736]
    end

    font_interstate
    text_box "#{@club.name.upcase}", size: 16, style: :light, at: location
  end

  def description_club_name
    font_interstate
    text_box "#{@club.name.upcase}", size: 20, style: :light, at: [220, 555]
  end

  def schedule_name
    location = @orientation == :landscape ? [634, 555] : [462, 740]

    font_interstate
    content = is_schedule ? "Week of #{Date.commercial(@schedule.year, @schedule.week).strftime('%m/%d/%y')}" : "#{@schedule.name}"
    text_box "#{content}", size: 8, at: location, width: 100, align: :right
  end

  def class_key
    location = @orientation == :landscape ? [334, 545] : [163, 730]

    font_arial
    letters = ('A'..'Z').to_a
    if @occurrences.present?
      to_print = daily_info[1].uniq.each_with_index.map { |name, index| "#{letters[index] } / #{name}"}.join("   ")
    else
      to_print = ""
    end
    text_box "*#{to_print}", size: 7, at: location, width: 400, align: :right
  end

  def description_address_phone
    font_interstate
    text_box "#{@club.address["address_1"]} | #{@club.phone}", size: 8, at: [530, 555], width: 200, align: :right
  end

  def description_hours
    font_arial
    transparent(0.5) do
      text_box "#{@club.hours.gsub(/\r\n/," ")}", size: 7, at: [230, 545], width: 500, align: :right
    end
  end

  def description_special_hours
    if @club.special_hours.present?
      font_arial
      transparent(0.5) do
        text_box "#{@club.special_hours.gsub(/\r\n/," ")}", size: 7, at: [230, 535], width: 500, align: :right
      end
    end
  end

  def description_fine_print
    font_arial
    transparent(0.5) do
      text_box "Visit crunch.com for online schedules and club information. This schedule is subject to change", size: 7, at: [41, 532], width: 500, align: :left
    end
  end

  def header_line_days
    line_placement = @orientation == :landscape ? [515, 500, 335, 235] : [700, 684, 345, 235]
    line_start = @orientation == :landscape ? -10 : -22
    line_end = @orientation == :landscape ? 735 : 562

    font_interstate
    transparent(0.3) do
      line_placement.each do |placement|
        horizontal_line line_start, line_end, at: placement
        stroke
        self.line_width = 1
      end
    end

    day_placement = @orientation == :landscape ? [[12, 505], [117, 505], [223, 505], [328, 505], [431, 505], [534, 505], [637, 505]] : [[3, 689], [83, 689], [164, 689], [245, 689], [326, 689], [406, 689], [487, 689]]

    if is_schedule
      date = @occurrences.first&.local_start_time || Date.today.beginning_of_week(:sunday)
      draw_text "SUNDAY, #{(date).strftime('%m/%d/%y')}", size: 8, at: day_placement[0]
      draw_text "MONDAY, #{(date + 1.days).strftime('%m/%d/%y')}", size: 8, at: day_placement[1]
      draw_text "TUESDAY, #{(date + 2.days).strftime('%m/%d/%y')}", size: 8, at: day_placement[2]
      draw_text "WEDNESDAY, #{(date + 3.days).strftime('%m/%d/%y')}", size: 8, at: day_placement[3]
      draw_text "THURSDAY, #{(date + 4.days).strftime('%m/%d/%y')}", size: 8, at: day_placement[4]
      draw_text "FRIDAY, #{(date + 5.days).strftime('%m/%d/%y')}", size: 8, at: day_placement[5]
      draw_text "SATURDAY, #{(date + 6.days).strftime('%m/%d/%y')}", size: 8, at: day_placement[6]
    else
      draw_text "SUNDAY", size: 8, at: day_placement[0]
      draw_text "MONDAY", size: 8, at: day_placement[1]
      draw_text "TUESDAY", size: 8, at: day_placement[2]
      draw_text "WEDNESDAY", size: 8, at: day_placement[3]
      draw_text "THURSDAY", size: 8, at: day_placement[4]
      draw_text "FRIDAY", size: 8, at: day_placement[5]
      draw_text "SATURDAY", size: 8, at: day_placement[6]
    end
  end

  def day_night_icons
    origin = @orientation == :landscape ? [[-18, 390], [-18, 275], [-18, 80]] : [[-27, 500], [-27, 275], [-27, 80]]
    location = @orientation == :landscape ? [[8, 377], [-15, 262], [5, 67]] : [[8, 487], [-15, 262], [5, 67]]

    transparent(0.3) do
      rotate(90, origin: origin[0]) do
        image "#{Rails.root}/public/images/c_class-morning.png", at: origin[0], width: 20
        text_box "MORNING", size: 8, at: location[0], width: 200
      end
      image "#{Rails.root}/public/images/c_class-noon.png", at: origin[1], width: 20
      rotate(90, origin: origin[1]) do
        text_box "MID-DAY", size: 8, at: location[1], width: 200
      end
      rotate(90, origin: origin[2]) do
        image "#{Rails.root}/public/images/c_class-night.png", at: origin[2], width: 20
        text_box "EVENING", size: 8, at: location[2], width: 200
      end
    end
  end

  def gray_days
    rectangle_origin_x = @orientation == :landscape ? [5, 216, 423, 630] : [-5, 157, 319, 481]
    rectangle_specs = @orientation == :landscape ? [515, 105, 530] : [700, 81, 710]

    transparent(0.05) do
      rectangle_origin_x.each do |x_axis|
        fill_rectangle [x_axis, rectangle_specs[0]], rectangle_specs[1], rectangle_specs[2]
      end
    end
  end

  def descriptions_lines_gray
    transparent(0.05) do
      fill_rectangle [182, 515], 182, 530
      fill_rectangle [546, 515], 182, 530
    end

    transparent(0.3) do
      vertical_line -15, 515, at: 182
      vertical_line -15, 515, at: 364
      vertical_line -15, 515, at: 546
      stroke
      self.line_width = 1
    end
  end

  def class_descriptions
    if class_finder_divider.present?
      x_axis = [10, 191, 374, 555]
      max_height = 500
      max_width = 163
      font_size = 7

      group_heights = class_finder_divider.map do |class_group|
        class_group.inject(0) do |acc, item|
          acc + 10 + 3 + height_of("#{item[:description]}", size: font_size, width: max_width)
        end
      end

      if group_heights.any? { |group| group > max_height }
        font_size = 6
      end

      x_axis.each_with_index do |x_axis, index|
        if class_finder_divider[index].present?
          bounding_box([x_axis, max_height], width: max_width, height: max_height) do
            font "Interstate"
            class_finder_divider[index].count.times do |program|
              pad_top(3) { text "#{class_finder_divider[index][program][:name]}: <font name='Arial' size='#{font_size}'>#{class_finder_divider[index][program][:description]}} </font>", size: font_size + 1, inline_format: true  }
              move_down 10
            end
          end
        end
      end
    end
  end

  def days_classes
    x_axis = @orientation == :landscape ? [12, 117, 223, 328, 431, 534, 637] : [2, 83, 164, 245, 326, 406, 487]
    move_down_amount = @orientation == :landscape ? 10 : 5
    move_cursor_amount = @orientation == :landscape ? [330, 230, 505] : [340, 230, 686]
    box_width = @orientation == :landscape ? 90 : 70
    box_height = @orientation == :landscape ? [158, 93, 245] : [335, 105, 228]

    x_axis.each_with_index do |x_axis, index|
      font_interstate
      move_down move_down_amount
      if daily_info.present?
        classes = daily_info[0][index + 1]
        if classes.present?
          morning = classes.select { |occurrence| occurrence[:time_of_day] == "morning" }
          class_size = morning.length
          font_size = if @orientation == :landscape
            class_size > 7 ? 5 : class_size > 5 ? 6 : 7
          else
            class_size > 15 ? 5 : class_size > 11 ? 6 : 7
          end
          if morning.present?
            bounding_box([x_axis, cursor], width: box_width, height: box_height[0]) do
              morning.each do |occurrence|
                font "Interstate"
                pad_top(3) { text "#{occurrence[:program_name]} <font name='Arial'> -  #{class_letters[occurrence[:room_name]]}*</font>", size: font_size, inline_format: true, overflow: :shrink_to_fit }
                font "Arial"
                pad_top(1.5) { text "#{occurrence[:start_time]} - #{occurrence[:duration]}m #{occurrence[:instructor]}", size: font_size, overflow: :shrink_to_fit }
              end
            end
          end
        end


        move_cursor_to move_cursor_amount[0]
        classes = daily_info[0][index + 1]
        if classes.present?
          midday = classes.select { |occurrence| occurrence[:time_of_day] == "midday" }
          class_size = midday.length
          font_size = class_size > 4 ? 5 : class_size > 3 ? 6 : 7
          if midday.present?
            bounding_box([x_axis, cursor], width: box_width, height: box_height[1]) do
              midday.each do |occurrence|
                font "Interstate"
                pad_top(3) { text "#{occurrence[:program_name]} <font name='Arial'> - #{class_letters[occurrence[:room_name]]}*</font>", size: font_size, inline_format: true, overflow: :shrink_to_fit }
                font "Arial"
                pad_top(1.5) { text "#{occurrence[:start_time]} - #{occurrence[:duration]}m #{occurrence[:instructor]}", size: font_size, overflow: :shrink_to_fit }
              end
            end
          end
        end

        move_cursor_to move_cursor_amount[1]
        classes = daily_info[0][index + 1]
        if classes.present?
          evening = classes.select { |occurrence| occurrence[:time_of_day] == "evening" }
          class_size = evening.length
          font_size = if @orientation == :landscape
            class_size > 10 ? 5 : class_size > 8 ? 6 : 7
          else
            class_size > 9 ? 5 : class_size > 6 ? 6 : 7
          end
          if evening.present?
            bounding_box([x_axis, cursor], width: box_width, height: box_height[2]) do
              evening.each do |occurrence|
                font "Interstate"
                pad_top(3) { text "#{occurrence[:program_name]} <font name='Arial'> - #{class_letters[occurrence[:room_name]]}*</font>", size: font_size, inline_format: true, overflow: :shrink_to_fit }
                font "Arial"
                pad_top(1.5) { text "#{occurrence[:start_time]} - #{occurrence[:duration]}m #{occurrence[:instructor]}", size: font_size, overflow: :shrink_to_fit }
              end
            end
          end
        end
        move_cursor_to move_cursor_amount[2]
      end
    end
  end

  def daily_info
    @daily_info ||= if @occurrences.present?
                      all_class_names = []
                      all_programs = []
                      days = Array.new(7, {
                        time_of_day: nil,
                        day_of_week: nil,
                        program_name: nil,
                        room_name: nil,
                        start_time: nil,
                        duration: nil,
                        instructor: nil,
                      })

                      @occurrences.sort_by(&:start_time).each_with_index do |occurrence, index|
                        scope = occurrence.respond_to?(:active_instructors) ? :active_instructors : :instructors
                        struct = {}
                        struct[:time_of_day] = time_of_day(occurrence.local_start_time)
                        struct[:day_of_week] = occurrence.day_of_week
                        struct[:program_name] = occurrence.program.name
                        program = occurrence.try(:occurrence_program) || occurrence.occurrence_template_program
                        struct[:room_name] = program.studio&.external_name
                        struct[:start_time] = occurrence.local_start_time.strftime('%l:%M')
                        struct[:duration] = occurrence.duration
                        struct[:instructor] = occurrence&.send(scope)&.first&.schedule_name || ''

                        days[index] = struct
                        all_class_names << program.studio&.external_name
                        all_programs << { name: occurrence.program.name, description: occurrence.program.description }
                      end
                      [days.group_by { |hash| hash[:day_of_week] }, all_class_names, all_programs]
                    end
  end

  def name_formatter(name)
    if name.nil?
      ""
    else
      split_name = ["- "]
      split_name << name.split(' ')[0]
      split_name << name.split(' ')[1].chars.first
      split_name.join(' ')

    end
  end

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

  def class_letters
    letters = letters = ('A'..'Z').to_a
    Hash[daily_info[1].uniq.zip letters]
  end

  def class_finder_divider
    @class_finder_divider ||= if daily_info.present?
                                classes = daily_info[2].uniq.sort_by { |c| c.fetch(:name) }
                                if classes.present?
                                  if classes.count % 4 == 0
                                    final_number = classes.count / 4
                                  else
                                    final_number = (classes.count / 4) + 1
                                  end
                                  classes.each_slice(final_number).to_a
                                end
                              end
  end

  def font_interstate
    font "Interstate"
  end

  def font_arial
    font "Arial"
  end
end
