include ActionDispatch::TestProcess

puts "  - Loading..."
### Methods

IMAGES = (1..1055).to_a

def editorial_image
  EditorialImage.new(
    caption: 'This is an image',
    image: fetch_image(480)
  )
end

def editorial_item
  EditorialItem.new(
    title: Faker::Book.title,
    subtitle: 'List Item Subtitle',
    content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
  )
end

def fetch_image(width)
  begin
    Dragonfly.app.fetch_url("http://fillmurray.com/640/#{width}").apply
  rescue
    retry while true
  end
end

def unique_image
  IMAGES.delete(IMAGES.sample)
end

addresses_path = Rails.root.join('db', 'seeds', 'addresses.yml')
tags_path = Rails.root.join('db', 'seeds', 'tags.yml')
places_path = Rails.root.join('db', 'seeds', 'places.yml')
place_names_path = Rails.root.join('db', 'seeds', 'places_names_jp.yml')
availabilities_path = Rails.root.join('db', 'seeds', 'availabilities.yml')

# ## Administrators
# puts "  - Administrators"
# Administrator.create({
#   first_name: 'Canvas',
#   last_name: 'Admin',
#   email: 'admin@canvas.is',
#   password: 'password',
#   confirmed_at: Time.zone.now
# })

# puts '  - Tags'
# YAML.load_file(tags_path).each do |params|
#   Tag.create!( name: params["name"], image: File.open(params["image"]) )
# end

# puts '  - Article'
# 10.times do |n|
#   article = Article.new(
#     {
#       title: Faker::Book.title[0..49],
#       description: Faker::Lorem.paragraph(3)[0..99],
#       content: 'Iste, in id ipsum culpa, reiciendis harum non ut inventore aspernatur?',
#       tag_ids: Tag.all.sample(3).map(&:id)
#     }
#   )
#   article.editorial_images << editorial_image
#   article.save
#   article.publish

#   sleep 1
# end

# puts '  - List Article'
# 10.times do |n|
#   list_article = ListArticle.new(
#     {
#       title: Faker::Book.title[0..49],
#       description: Faker::Lorem.paragraph(3)[0..99],
#       content: 'Iste, in id ipsum culpa, reiciendis harum non ut inventore aspernatur?',
#       tag_ids: Tag.all.sample(3).map(&:id)
#     }
#   )
#   list_article.editorial_images << editorial_image
#   list_article.editorial_items << editorial_item
#   list_article.save
#   list_article.publish

#   sleep 1
# end

# puts '  - Press Release'
# 5.times do |n|
#   PressRelease.create(
#     {
#       title: 'Press Release 1',
#       content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
#       tag_ids: Tag.all.sample(3).map(&:id)
#     }
#   )
# end

# Editorial.reindex

# puts '  - Life And Culture'
# lc = LifeAndCulture.new({
#   left_editorial_id: Article.published.sample.id,
#   right_editorial_id: ListArticle.published.sample.id,
#   tag_ids: Tag.all.sample(6).map(&:id)
# })

# puts '  - Shopping And Food'
# articles = Article.published.sample(3)
# list_articles = ListArticle.published.sample(2)
# sf = ShoppingAndFood.new({
#   left_editorial_id: articles[0].id,
#   right_editorial_id: list_articles[0].id,
#   large_editorial_id: articles[1].id,
#   top_editorial_id: list_articles[1].id,
#   bottom_editorial_id: articles[2].id,
#   tag_ids: Tag.all.sample(6).map(&:id)
# })

puts '  - Videos'
video_url = [
  'https://player.vimeo.com/external/97800126.hd.mp4?s=75ef43cfb433be63d60e4c68e1df1dd3f9ea71bf&profile_id=119',
  'https://player.vimeo.com/external/158245512.hd.mp4?s=c020bb8f80dde0b3fd803cde35fb9985b41f7daa&profile_id=119',
  'https://player.vimeo.com/external/156053219.hd.mp4?s=854e0d714c96dd256803d71e98f521a678a09c49&profile_id=119',
  'https://player.vimeo.com/external/154933457.hd.mp4?s=65f9a45d34a92851b227f53cd2c53a034eb3edf3&profile_id=119'
]
# 4.times do |i|
#   lc.videos << Video.create(title: Faker::Book.title, url: video_url[i])
# end

# p 'Life and Culture created' if lc.save
# p 'Shopping and Food created' if sf.save

### Hompage
# homepage = Homepage.new({
#   editorial_id: Article.published.first.id,
#   image: fetch_image(480),
#   tag_line: Faker::Hipster.sentence
# })

# puts '  - Homepage Tabs'
# 3.times do |tab|
#   article_id = Article.pluck(:id).shuffle
#   homepage.tabs << Tab.create(
#     title: "A grid tab #{tab + 1}",
#     large_editorial_id: article_id.pop,
#     top_editorial_id: article_id.pop,
#     bottom_editorial_id: article_id.pop
#   )
# end

# puts '  - Homepage Quick Links'
# 4.times do |link|
#   homepage.quick_links << QuickLink.create(
#     title: "This is an example of a link #{link + 1}",
#     url: '/'
#   )
# end

# homepage.quick_links << QuickLink.create(
#   title: 'Promotion quick link',
#   description: 'This is a hero promotional description & is 57 characters',
#   promotion_module: true,
#   url: '/'
# )

# puts '  - Homepage Neighborhood Recommendations'
# 4.times do |rec|
#   homepage.recommendations << Recommendation.create(
#     title: "This is a neighborhood recommendation #{rec + 1}",
#     url: '/',
#     image: fixture_file_upload(
#       Rails.root.join('spec', 'fixtures', 'images', 'yoga.jpg'),
#       'image/jpg'
#     )
#   )
# end

# homepage.save

# #### Events
# puts '  - Events & Occurrences'
# 4.times do
#   event = Event.new(
#     place_id: 1,
#     status: 1,
#     published_at: Time.zone.now,
#     title: Faker::Book.title[0..49],
#     description: Faker::Lorem.paragraph[0..139],
#     recurrence: Faker::Lorem.sentence[0..29],
#     image: fixture_file_upload(
#       Rails.root.join('spec', 'fixtures', 'images', 'yoga.jpg'),
#       'image/jpg'
#     )
#   )

#   2.times do
#     event.occurrences << Occurrence.create(
#       date: Date.today,
#       start_time: Time.zone.now + 1.day,
#       end_time: Time.zone.now  + 25.hour,
#       link_cta: 'Explore Event',
#       link_url: Faker::Internet.url
#     )
#   end

#   event.save
# end

# Event.reindex

# ### Event Promos
# puts '  - Event Promotion'
# EventPromo.create([
#   {
#     title: Faker::Book.title[0..19],
#     description: Faker::Lorem.paragraph[0..139],
#     link_cta: 'Explore Event',
#     link_url: Faker::Internet.url,
#     image: fixture_file_upload(
#       Rails.root.join('spec', 'fixtures', 'images', 'image.jpg'),
#       'image/jpg'
#     )
#   },
#   {
#     title: Faker::Book.title[0..19],
#     description: Faker::Lorem.paragraph[0..139],
#     link_cta: 'Explore Event',
#     link_url: Faker::Internet.url,
#     status: 1,
#     published_at: Time.zone.now,
#     image: fixture_file_upload(
#       Rails.root.join('spec', 'fixtures', 'images', 'yoga.jpg'),
#       'image/jpg'
#     )
#   }
# ])

# #### Buildings
# puts '  - Buildings'
# Building.create([
#   {
#     name: 'Waiea',
#     tagline: "\"Water of Life\" in Hawaiian",
#     estimated_move_in: 'Q4 2016',
#     status: '$500k - $10M',
#     price_range: '$2M - $10M',
#     home_types: '174',
#     anchor: 'Nobu: the worlds most recognized Japanese restaurant',
#     position: 1,
#     image: fixture_file_upload(
#           Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
#           'image/jpg'
#         )
#   },
#   {
#     name: 'Anaha',
#     tagline: "\"Water of Life\" in Hawaiian",
#     estimated_move_in: 'Q2 2017',
#     status: '$500k - $10M',
#     price_range: '$2M - $10M',
#     home_types: '317',
#     anchor: "Merriam's: offers Hawaii regional cuisine using fresh local produce",
#     position: 2,
#     image: fixture_file_upload(
#           Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
#           'image/jpg'
#         )
#   },
#   {
#     name: "Ae'o",
#     tagline: "\"Water of Life\" in Hawaiian",
#     estimated_move_in: 'Q4 2018',
#     status: '$500k - $10M',
#     price_range: '$2M - $10M',
#     home_types: '466',
#     anchor: 'Whole Foods Market: your supermarket for high quality organic food',
#     position: 3,
#     image: fixture_file_upload(
#           Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
#           'image/jpg'
#         )
#   },
#   {
#     name: 'Ke Kilohana',
#     tagline: "\"Water of Life\" in Hawaiian",
#     estimated_move_in: 'Q1 2019',
#     status: '$500k - $10M',
#     price_range: '$2M - $10M',
#     home_types: '424',
#     anchor: "Long's Drugs: Hawaii's most convenient pharmacy",
#     position: 4,
#     image: fixture_file_upload(
#           Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
#           'image/jpg'
#         )
#   },
#   {
#     name: 'Gateway Towers',
#     tagline: "\"Water of Life\" in Hawaiian",
#     estimated_move_in: 'Q4 2019',
#     status: '$500k - $10M',
#     price_range: '$2M - $10M',
#     home_types: '125',
#     anchor: 'TBD',
#     position: 6,
#     image: fixture_file_upload(
#           Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
#           'image/jpg'
#         )
#   },
#   {
#     name: "'A'ali'i",
#     tagline: "TBD",
#     estimated_move_in: 'TBD',
#     status: 'TBD',
#     price_range: 'TBD',
#     home_types: 'TBD',
#     anchor: 'TBD',
#     position: 5,
#     image: fixture_file_upload(
#           Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
#           'image/jpg'
#         )
#   }
# ])

### Pages
puts "  - Pages"
Page.create([
  {
    name: 'Neighborhood',
    title: Faker::Book.title[0..41],
    description: Faker::Lorem.paragraph[0..349],
    type: 'Page::Neighborhood',
    status: 1,
    published_at: Time.zone.now,
    image: fetch_image(220)
  },
  {
    name: 'Residences',
    title: Faker::Book.title[0..41],
    description: Faker::Lorem.paragraph[0..349],
    type: 'Page::Residence',
    status: 1,
    published_at: Time.zone.now,
    video_url: 'https://player.vimeo.com/external/97800126.hd.mp4?s=75ef43cfb433be63d60e4c68e1df1dd3f9ea71bf&profile_id=119',
    image: fetch_image(220),
    tag_ids: Tag.all.sample(6).map(&:id)
  }
]).each do |p|
  4.times do |i|
    p.sections << Section.new(title: p.section_names('en')[i])
    p.videos << Video.create(title: Faker::Book.title, url: video_url[i]) if p.type == 'Page::Residence'
  end
  p.save
end

puts '  - Panels'
Section.all.each do |section|
  section.panels.create([
    {
      title: Faker::Book.title[0..18],
      description: Faker::Lorem.paragraph[0..59],
      upper_link_url: Faker::Internet.url,
      upper_link_cta: Faker::Hipster.sentence(2, false, 0)[0..21],
      lower_link_url: Faker::Internet.url,
      lower_link_cta: Faker::Hipster.sentence(2, false, 0)[0..21]
    },
    {
      title: Faker::Book.title[0..18],
      description: Faker::Lorem.paragraph[0..59],
      upper_link_url: Faker::Internet.url,
      upper_link_cta: Faker::Hipster.sentence(2, false, 0)[0..21],
      lower_link_url: Faker::Internet.url,
      lower_link_cta: Faker::Hipster.sentence(2, false, 0)[0..21]
    }
  ])
end

## Block Templates
puts '  - Block Templates'
Page.find_by_type('Page::Residence').sections.each do |section|
  section.panels.first.block_templates.create(
    {
      type: 'BuildingBlock',
      building_id: Building.pluck(:id).sample
    }
  )
end

Page.find_by_type('Page::Residence').panels.second.block_templates.create({ type: 'BuildingListBlock' })

Panel.all.each do |panel|
  ['SingleBlock', 'DoubleBlock', 'LeftBlock', 'RightBlock', 'ListBlock'].sample(2).each do |block|
    template = block.constantize.new
    BlockTemplate::IMAGE_COUNT[block].times do
      images = block == 'SingleBlock' ? BlockImage.create(image: fetch_image(220), caption: 'Something', subcaption: 'Something else') : BlockImage.create(image: fetch_image(480), caption: 'Something', subcaption: 'Something else')
      template.block_images << images
    end
    panel.block_templates << template
    template.save
  end
end

#### Categories
puts '  - Categories'
Category.create([
  { id: 1, name: 'Food' },
  { id: 2, name: 'Shopping' },
  { id: 3, name: 'Arts & Entertainment' },
  { id: 4, name: 'Recreation' },
  { id: 5, name: 'Transportation' },
  { id: 6, name: 'Services & Offices' }
])

#### Subcategories
puts '  - Subcategories'
Subcategory.create([
  { name: "Chinese/Hot Pot", category_id: 1},
  { name: "American", category_id: 1},
  { name: "Coffee & Juice", category_id: 1},
  { name: "Dessert", category_id: 1},
  { name: "Fast Food", category_id: 1},
  { name: "Mexican", category_id: 1},
  { name: "Japanese", category_id: 1},
  { name: "Vietnamese", category_id: 1},
  { name: "Korean", category_id: 1},
  { name: "Local/Hawaiian", category_id: 1},
  { name: "Italian", category_id: 1},
  { name: 'Island & Active Wear', category_id: 2},
  { name: 'Beauty Products & Salons', category_id: 2},
  { name: 'Clothing Stores & Boutiques', category_id: 2},
  { name: "Children's Apparel", category_id: 2},
  { name: "Hawaiian Arts & Gifts", category_id: 2},
  { name: "Homegoods", category_id: 2},
  { name: "Grocery & Convenience Stores", category_id: 2},
  { name: "Footwear & Accessories", category_id: 2},
  { name: "Specialty Stores", category_id: 2},
  { name: "Specialty Food", category_id: 2},
  { name: "Stationary/Books", category_id: 2},
  { name: "Movies & Games", category_id: 3},
  { name: "Entertainment Venues", category_id: 3},
  { name: "Murals & Statues", category_id: 3},
  { name: "Fitness", category_id: 4},
  { name: "Parks & Beaches", category_id: 4},
  { name: "Fishing", category_id: 4},
  { name: "Scuba Diving", category_id: 4},
  { name: "Other Ocean Activities", category_id: 4},
  { name: "Sailing", category_id: 4},
  { name: "Bus", category_id: 5},
  { name: "Bike Racks", category_id: 5},
  { name: "Parking Lots", category_id: 5},
  { name: "Volta Charging Stations", category_id: 5},
  { name: "Trolleys", category_id: 5},
  { name: "Offices", category_id: 6},
  { name: "Services", category_id: 6},
  { name: "Restrooms", category_id: 6}
])

#### Establishments
puts '  - Establishments'

Establishment.create([
  { name: "Anaha" },
	{ name: "IBM Building" },
	{ name: "Ke Kilohana" },
	{ name: "Kewalo Harbor" },
	{ name: "Waiea" },
	{ name: "Ward Centre" },
	{ name: "Ward Entertainment Center" },
	{ name: "Ward Gateway Center" },
	{ name: "Ward Industrial Center" },
	{ name: "Ward Village Shops" },
	{ name: "Ward Warehouose" },
	{ name: "West of Ward" }
])

#### Places
puts '  - Places'
YAML.load_file(places_path).each do |params|
  Place.create!(category_id: params["category_id"],
                subcategory_id: params["subcategory_id"],
                name: params["name"],
                establishment_id: params["establishment_id"],
                phone: params["phone"],
                summary: params["summary"],
                description: params["description"],
                link_1_cta: params["link_1_cta"],
                link_1_url: params["link_1_url"],
                address: Address.create(address_line_1: params["address"]["address_line_1"],
                                     address_line_2: params["address"]["address_line_2"],
                                     city: params["address"]["city"],
                                     state: params["address"]["state"],
                                     zipcode: params["address"]["zipcode"]),
                location: Location.create(geo_json_data: params["location"]["geo_json_data"]),
                image: fixture_file_upload(
                         Rails.root.join("app", "assets", "images", "ward_placeholder.jpg"),
                         'image/jpg'
                       ),
                status: 1,
                published_at: Time.zone.now)
end

YAML.load_file(place_names_path).each do |params|
  Place::Translation.create(place_id: params["place_id"], locale: params["locale"], name: params["name"])
end

YAML.load_file(availabilities_path).each do |params|
  Availability.find_or_create_by(place_id: params["place_id"], weekday: params["weekday"]).update(availability_hours: [AvailabilityHour.create(start_time: params["availability_hours"]["start_time"], finish_time: params["availability_hours"]["finish_time"])])
end

Place.reindex

#### Deals
# puts '  - Deals'
#
# Place.all.each do |place|
#   2.times do
#     place.deals.create(
#       name: Faker::Hipster.sentence,
#       description: Faker::Hipster.paragraph,
#       image: fetch_image(480),
#     )
#     sleep 1
#   end
# end
#
# Deal.all.sample(7).each(&:publish)
#
#### Editor's Picks

puts "  - Editor's picks"

5.times do
  Pick.create({
    title: Faker::Hipster.sentence,
    place_ids: Place.pluck(:id).sample(3)
  })
end

### Established Redirects (from location.block.erb)
puts "  - Slugs"
Slug.create([
  { vanity_url: "aalii", redirect_url: "en/marketing/7/" },
  { vanity_url: "japantimes", redirect_url: "en/marketing/8/" },
  { vanity_url: "jcb", redirect_url: "en/marketing/9/" },
  { vanity_url: "arcdigest", redirect_url: "en/marketing/10/" },
  { vanity_url: "departures", redirect_url: "en/marketing/11/" },
  { vanity_url: "modernluxury", redirect_url: "en/marketing/12/" },
  { vanity_url: "luxuryhome", redirect_url: "en/marketing/13/" },
  { vanity_url: "hiluxury", redirect_url: "en/marketing/14/" },
  { vanity_url: "kahalalife", redirect_url: "en/marketing/15/" },
  { vanity_url: "nativo", redirect_url: "en/marketing/16/" },
  { vanity_url: "wsj", redirect_url: "en/marketing/17/" },
  { vanity_url: "LuxuryMag", redirect_url: "en/marketing/18/" },
  { vanity_url: "sonyopen", redirect_url: "en/marketing/19/" },
  { vanity_url: "MyHawaii", redirect_url: "en/marketing/20/" },
  { vanity_url: "Forbes", redirect_url: "en/marketing/21/" },
  { vanity_url: "JAL", redirect_url: "en/marketing/22/'" },
  { vanity_url: "Dossier", redirect_url: "en/marketing/23/" },
  { vanity_url: "Rhapsody", redirect_url: "en/marketing/24/" },
  { vanity_url: "Living", redirect_url: "en/marketing/31/" },
  { vanity_url: "Reserve", redirect_url: "en/marketing/32/" },
  { vanity_url: "Table", redirect_url: "en/marketing/33/" },
  { vanity_url: "holiday", redirect_url: "en/events/holiday-happenings-in-ward-village" },
  { vanity_url: "valentines", redirect_url: "en/editorials/your-guide-to-the-perfect-valentine-s-day" }
])
