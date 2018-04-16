class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :fact_sheet_pdf
  before_action :set_defaul_target

  private

  def fact_sheet_pdf
    @fact_sheet = Pdf.find_by_name("Fact Sheet")
  end

  def set_default_target
    @target_variable = '_self'
  end
end
