class LandingPagesController < ApplicationController
  before_action :set_landing_page

  def show
    if @landing_page.nil? || !@landing_page.is_published?
      redirect_to homepage_path, status: 302
    end
  end

  private

  def set_landing_page
    @landing_page = LandingPage.find(params[:id])
  end
end
