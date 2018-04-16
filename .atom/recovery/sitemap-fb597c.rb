require 'rubygems'
require 'sitemap_generator'

# Set the host name for URL creation
SitemapGenerator::Sitemap.default_host = 'http://www.thebeekman.com'

# pick a place safe to write the files
SitemapGenerator::Sitemap.public_path = 'tmp/'

SitemapGenerator::Sitemap.adapter = SitemapGenerator::S3Adapter.new(fog_provider: 'AWS',
                                         aws_access_key_id: ENV['AWS_ACCESS_KEY'],
                                         aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
                                         fog_directory: 'production.assets.thebeekman.com',
                                         fog_region: 'us-west-2')

SitemapGenerator::Sitemap.sitemaps_host = "http://s3-us-west-2.amazonaws.com/production.assets.thebeekman.com/"
SitemapGenerator::Sitemap.include_root = false

SitemapGenerator::Sitemap.create do

  # Default Values
  #-----------------------------------------
  # changefreq: 'weekly'
  # lastmod: Time.now

  add root_path, changefreq: 'weekly', priority: 1.0, lastmod: nil
  add hotel_path, priority: 0.9, lastmod: nil
  add rooms_path, priority: 0.9, lastmod: nil
  add eat_and_drink_path, priority: 0.9, lastmod: nil
  add events_path, priority: 0.9, lastmod: nil
  add neighborhood_path, priority: 0.9, lastmod: nil
  add posts_path, priority: 0.9, lastmod: nil
  add offers_path, priority: 0.8, lastmod: nil

  Offer.published.each do |offer|
    add offer_path(offer), priority: 0.8, lastmod: offer.updated_at
  end

  LandingPage.published.each do |lp|
    add landing_page_path(lp), priority: 0.8, lastmod: lp.updated_at
  end

  Post.published.each do |post|
    add post_path(post), priority: 0.8, lastmod: post.updated_at
  end

  add temple_court_path, priority: 0.8, lastmod: nil
  add the_bar_room_path, priority: 0.8, lastmod: nil
  add faq_path, priority: 0.5, lastmod: nil
  add press_path, priority: 0.6, lastmod: nil
  add privacy_policy_path, priority: 0.5, lastmod: nil
  add '/beekman-events-package.pdf', priority: 0.4, lastmod: '2016-12-16T15:00:29-05:00'
end
