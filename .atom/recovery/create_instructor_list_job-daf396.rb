class CreateInstructorListJob < ApplicationJob
  queue_as :class_default

  def perform(*args)
    # Do something later
  end
end
