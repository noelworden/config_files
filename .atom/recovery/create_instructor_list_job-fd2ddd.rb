class CreateInstructorListJob < ApplicationJob
  queue_as :class_default

  def perform
    csv_content = InstructorListCSV.generate_csv

    InstructorMailer.instructors_list_email(csv_content).deliver
  end
end
