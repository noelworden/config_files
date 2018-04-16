class ChangeColumnNamesOccurrences < ActiveRecord::Migration[5.0]
  def change
    # rename_column :table, :old_column, :new_column
    rename_column :occurrences, :guest_checked_in_count, :
    rename_column :occurrences, :guest_attended_count
  end
end
