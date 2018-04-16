class AddTourLinkToSpaces < ActiveRecord::Migration[5.1]
  def change
    add_column :spaces, :tour_link, :string
  end
end
