require 'rails_helper'

RSpec.describe Student, type: :model do
  it { should validate_presence_of(:first_name) }
end
