# frozen_string_literal: true
class PardotService
  include HTTParty

  def initialize(params = {})
    @first_name = params[:first_name]
    @last_name = params[:last_name]
    @phone = params[:phone]
    @email = params[:email]
    @zip = params[:zip]
    @location = params[:location]
    @how_hear = params[:how_hear]
    @net_worth = params[:net_worth]
    @capital = params[:capital]
  end

  def send_prospect
    @response = HTTParty.post(
      'https://go.pardot.com/l/279592/2017-05-31/h4bs',
      query: {
        first_name: @first_name,
        last_name: @last_name,
        phone: @phone,
        email: @email,
        zip: @zip,
        location: @location,
        how_hear: @how_hear,
        net_worth: @net_worth,
        capital: @capital
      }
    )
  end
end
