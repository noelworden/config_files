require 'csv'

module PayrollCSV
  def self.generate_csv(occurrences)
    attributes = %w{ club club_no class_name was_subbed1 instructor_1 employeeID1
                     hourly1 orig_instructor1 orig_employeeID1 was_subbed2 instructor_2
                     employeeID2 hourly2 orig_instructor2 orig_employeeID2 was_subbed3
                     instructor_3 employeeID3 hourly3 orig_instructor3 orig_employeeID3
                     was_subbed4 instructor_4 employeeID4 hourly4 orig_instructor4
                     orig_employeeID4 attendees signins was_taught datetime duration
                     studio total_inventory class_pass_inventory comments }

    CSV.generate(headers: true) do |csv|
      csv << attributes

      club_hash = Club.id_hash
      
      # TODO refactor this entire process
      occurrences.each do |occurrence|
        club = club_hash[occurrence.club_id]

        if club.blank?
          club = Club.find(occurrence.club_id)

          next if club.blank?
          
          club_hash[club.id] = club 
        end
        

        row = [club.name, club.reporting_id, occurrence.name]

        occurrence.instructor_struct.each do |instructor|
          row = row + [
                        instructor[:was_subbed],
                        instructor[:taught],
                        instructor[:taught_id],
                        instructor[:taught_hourly_rate],
                        instructor[:original],
                        instructor[:original_id]
                      ]
        end
        row = row + [
                occurrence.attendance,
                occurrence.check_ins,
                occurrence.was_taught,
                occurrence.local_start_time.strftime('%b %-d %Y %l:%M %p'),
                occurrence.duration,
                occurrence.studio_name,
                occurrence.total_availability,
                occurrence.class_pass_availability,
                occurrence.comments
              ]
        csv << row
      end
    end
  end
end
