# == Schema Information
#
# Table name: promos
#
#  id                    :integer          not null, primary key
#  title                 :string
#  image_data            :text
#  external_link_url     :string
#  published_at          :datetime
#  custom_published_date :date
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#

class PromoSerializer < ActiveModel::Serializer
  attributes :id, :title, :image_url, :external_link_text

  def image_url
    object.image_url(:original)
  end
end
