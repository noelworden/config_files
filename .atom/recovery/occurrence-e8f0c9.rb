# frozen_string_literal: true
# == Schema Information
#
# Table name: occurrences
#
#  id                      :integer          not null, primary key
#  schedule_id             :integer
#  club_id                 :integer
#  duration                :integer
#  day_of_week             :integer
#  start_time              :datetime
#  pdf_visible             :boolean
#  comments                :text
#  member_count            :integer
#  member_instructor_count :integer
#  cancelled               :boolean          default(FALSE), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  reconciled              :boolean          default(FALSE)
#  walk_in_count           :integer          default(0), not null
#  instructor_count        :integer          default(0), not null
#  count_verified          :boolean          default(FALSE)
#  local_start_time        :datetime
#  deleted_at              :datetime
#
# Indexes
#
#  index_occurrences_on_club_id                       (club_id)
#  index_occurrences_on_club_id_and_local_start_time  (club_id,local_start_time)
#  index_occurrences_on_club_id_and_start_time        (club_id,start_time)
#  index_occurrences_on_deleted_at                    (deleted_at)
#  index_occurrences_on_schedule_id                   (schedule_id)
#

# TODO - Remove me!
## update data script
# Proc.new do
#   t1 = Time.now
#   Club.all
#   Occurrence.find_each do |o|
#     o.local_start_time =  o.adjusted_start_time
#     o.save
#   end
#   t2 = Time.now
#   puts "#{t2 - t1} seconds for save"
# end
#
# payroll script
# proc = Proc.new { t1 = Time.zone.now; PayrollCSV.generate_csv(Occurrence.payroll_csv); t2 = Time.zone.now; puts "#{t2 - t1} seconds" }

class Occurrence < ApplicationRecord
  include TimeTrackable
  include ClubAssociation

  has_paper_trail
  acts_as_paranoid

  # associations
  # ================
  belongs_to :schedule, touch: true

  has_one  :occurrence_program
  has_one  :program, through: :occurrence_program
  has_one  :studio, through: :occurrence_program
  has_many :slots, through: :studio
  has_many :reservations, dependent: :destroy
  has_many :reserved_slots, through: :reservations, source: :slot
  has_many :occurrence_substitutes, dependent: :destroy
  has_many :substitutes, through: :occurrence_substitutes
  has_many :substitutees, through: :occurrence_substitutes, source: :instructor
  has_many :instructors_occurrences, dependent: :destroy
  has_many :instructors, through: :instructors_occurrences
  has_many :strikes, through: :reservations

  accepts_nested_attributes_for :occurrence_substitutes, allow_destroy: true
  accepts_nested_attributes_for :occurrence_program, allow_destroy: true
  accepts_nested_attributes_for :program
  accepts_nested_attributes_for :reservations, allow_destroy: true
  accepts_nested_attributes_for :instructors_occurrences, allow_destroy: true
  accepts_nested_attributes_for :strikes, allow_destroy: true

  # validations
  # ================
  validates :duration, presence: true
  validates :start_time, presence: true
  validates :walk_in_count, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :instructor_count, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # scopes
  # ================
  scope :with_csv_data, -> { includes(:reservations, :instructors, :instructors, :studio, program: :category, occurrence_substitutes: [:instructor, :substitute]) }

  ### Time based scopes
  scope :by_time_range, -> (range_start, range_end) { where(start_time: range_start..range_end).order(:club_id, :start_time) }
  scope :by_local_time_range, -> (range_start, range_end) { where(local_start_time: range_start..range_end).order(:club_id, :start_time) }
  scope :by_club_and_time, -> (club_id, range_start = Time.zone.now, range_end = (Time.zone.now + 6.days)) {
    by_time_range(range_start, range_end).where(club_id: club_id)
  }
  scope :by_local_club_and_time, -> (club_id, range_start = Time.zone.now, range_end = (Time.zone.now + 6.days)) {
    by_local_time_range(range_start, range_end).where(club_id: club_id)
  }

  # These scopes consider the middle of the month as the 15th
  scope :mid_month_report,  -> do
    base_time = Time.zone.yesterday

    range_start, range_end = if base_time.day <= 15
                               [base_time.beginning_of_month, base_time.end_of_day]
                             else
                               [base_time.change(day: 16).beginning_of_day, base_time.end_of_day]
                             end

      with_csv_data.by_local_time_range(range_start, range_end)
  end

  scope :today_plus_two_weeks, -> { with_csv_data.by_local_time_range(Date.today.midnight, Date.today.end_of_week + 2.weeks) }

  scope :by_instructor_names, -> (instructors_arr) { joins(:instructors).where('instructors.full_name IN (?)', instructors_arr) }
  scope :by_program_name, -> (program_name) { joins(:program).where('name = (?)', program_name) }
  scope :by_categories, -> (categories_arr) { joins(program: :category).where('categories.name IN (?)', categories_arr)}
  scope :by_availability, -> { where(cancelled: false).joins(:occurrence_program).where('occurrence_programs.in_club_availability + occurrence_programs.class_pass_availability + occurrence_programs.online_availability > 0') }
  scope :active, -> { where(cancelled: false) }

  # callbacks
  # ================
  after_save :notify_members, if: :cancelled
  before_save :verify_before_reconcile
  before_save :set_day_of_week
  after_create :schedule_signin_email

  delegate :name, :description, to: :program

  def active_instructors
    instructors.map do |instructor|
      occurrence_substitutes.find { |os| os.instructor_id == instructor.id }&.substitute || instructor
    end
  end

  def remaining_reservation_count
    occurrence_program.total_availability - walk_in_count - reservations.count - occurrence_program.class_pass_availability
  end

  def actual_instructors
    instructors + occurrence_substitutes.map(&:substitute) - occurrence_substitutes.map(&:instructor)
  end

  def padded_instructors(instructors)
    (4 - instructors.length).times { instructors << '' }
    instructors
  end

  # reservations.attended.count as count will result in n+1 query, better to use ruby enumerable
  def attendance
    self.instructor_count + self.reservations.select(&:attended).length
  end

  def check_ins
    self.walk_in_count + self.reservations.select(&:attended).length
  end

  def was_taught
    (!cancelled && reconciled) ?  1 : 0
  end

  def total_availability
    self.occurrence_program.nil? ? 0 : self.occurrence_program.total_availability
  end

  def class_pass_availability
    self.occurrence_program.nil? ? 0 : self.occurrence_program.class_pass_availability
  end

  def studio_name
    self.occurrence_program.nil? ? '' : self.occurrence_program.studio&.external_name
  end

  def available_slot_count
    occurrence_program.total_availability - reservations.length
  end

  def must_choose_slot
    !!occurrence_program&.studio&.has_slots?
  end

  def bookable
    (self.start_time - 22.hours) < Time.zone.now &&
    (self.start_time - 30.minutes) > Time.zone.now &&
    !self.cancelled &&
    self.available_slot_count.positive? &&
    club&.online_reservations
  end

  def verify_before_reconcile
    if self.reconciled? && !self.count_verified?
      errors[:base] << 'Cannot reconcile a class without verifying the additional check-in & attendee counts'
      throw :abort
    end
  end

  def schedule_signin_email
    SignInMailerJob.set(wait_until: start_time - 30.minutes).perform_later(club_id, self)
  end

  # TODO refactor this entire process
  def instructor_struct
    teachers = Array.new(4, {
                              taught: nil,
                              taught_id: nil,
                              taught_hourly_rate: nil,
                              original: nil,
                              original_id: nil,
                              was_subbed: nil,
                              class_name: nil,
                              class_time: nil
                            }
                        )

    instructors.each_with_index do |instructor, index|
      struct = {}
      occurrence_substitute = occurrence_substitutes.find { |os| os.instructor_id = instructor.id }
      if occurrence_substitute
        struct[:taught] = occurrence_substitute.substitute.full_name
        struct[:taught_id] = occurrence_substitute.substitute.employee_number
        struct[:taught_hourly_rate] = occurrence_substitute.substitute.hourly_pay
        struct[:original] = instructor.full_name
        struct[:original_id] = instructor.employee_number
        struct[:was_subbed] = 1
      else
        struct[:taught] = instructor.full_name
        struct[:taught_id] = instructor.employee_number
        struct[:taught_hourly_rate] = instructor.hourly_pay
        struct[:original] = nil
        struct[:original_id] = nil
        struct[:was_subbed] = 0
      end
      struct[:class_name] = self.program.name
      struct[:class_time] = self.start_time
      teachers[index] = struct
    end
    teachers
  end

  def club_time
    @club_time ||= ClubTime.new(club_id)
  end

  # DEPRACATED -- replaced by local_start_time column
  # This is the current start_time, with a time zone adjustment, but set as UTC
  def adjusted_start_time
    club_time.adjust(start_time)
  end

  def local_end_time
    local_start_time + self.duration.minutes
  end

  def start_time=(time)
    self.local_start_time = time
    super(club_time.unadjust(time))
  end

  def active?
    !cancelled && start_time > Time.zone.now
  end

  def available_slots
    (slots - reserved_slots).select { |slot| slot.active == 'available' }
  end

  def get_slot(number = nil)
    if number.present?
      available_slots.find { |slot| slot.number == number }
    else
      available_slots.first
    end
  end

  def member_ids
    reservations.map(&:member_id)
  end

  def not_reconciled
    self.reconciled == false
  end

  private
  def notify_members
    MembersService.notify_on_cancel(member_ids, id) if cancelled_changed?
  end

  def set_day_of_week
    self.day_of_week = self.local_start_time.wday + 1 if self.day_of_week.nil?
  end
end
