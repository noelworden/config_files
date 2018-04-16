class PagesController < ApplicationController
  # include HighVoltage::StaticPage
  before_action :set_temple, only:[:eat_and_drink, :temple_court]
  before_action :set_bar_room, only:[:eat_and_drink, :the_bar_room]

  def hotel
    @artist = Artist.first
  end

  def homepage
  end

  def eat_and_drink
    @temple_pdfs = Pdf.temple_court
    @bar_room_pdf = Pdf.where(section: "The Bar Room")
  end

  def temple_court
    @temple_pdfs = Pdf.temple_court
  end

  def events
    @spaces = Space.includes(:space_images, :space_floor_plans).all
    @offer = Offer.event_offer
  end

  def faq
    @general = Faq.where(category: 0)
    @rooms = Faq.where(category: 1)
    @transportation = Faq.where(category: 2)
  end

  def neighborhood
  end

  def privacy_policy
  end

  def the_bar_room
    @bar_room_pdf = Pdf.where(section: "The Bar Room")
  end

  def temple_booking
  end

  private

  def set_temple
    @temple_gallery = Carousel.first.carousel_images.each.map { |img| img.image.remote_url }
  end

  def set_bar_room
    bar_room = Carousel.second
    @left_gallery = bar_room.left_gallery
    @right_gallery = bar_room.right_gallery
  end
end
