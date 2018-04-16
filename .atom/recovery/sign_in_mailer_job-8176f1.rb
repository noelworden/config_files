# frozen_string_literal: true

class SignInMailerJob < ApplicationJob
  queue_as :class_mailers

  def perform(club_id, occurrence)
    SignInPdfMailer.sign_in_mailer(club_id, occurrence).deliver_later
  end
end
