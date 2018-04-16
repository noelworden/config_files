class Student < ApplicationRecord
  validates :first_name, presence: true
end
