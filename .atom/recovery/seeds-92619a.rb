$stdout.sync = true

puts "  - Loading..."

IMAGES = (1..1055).to_a

def room_image(pos)
  RoomImage.new(
    caption: Faker::Hipster.sentence,
    image: fetch_image,
    position: pos
  )
end

def space_image(pos)
  SpaceImage.new(
    image: fetch_image,
    position: pos
  )
end

def fetch_asset(url)
  begin
    Dragonfly.app.fetch_url(url).apply
  rescue
    retry while true
  end
end

def fetch_image
  # fetch_asset "https://unsplash.it/1365/1024?image=#{unique_image}"
  fetch_asset "https://www.fillmurray.com/1365/1024"
end

def unique_image
  IMAGES.delete(IMAGES.sample)
end

def list_items(count)
  list = ''
  count.times do
    list += "<li>#{Faker::Hipster.sentence}</li>"
  end
  list
end

def time_rand from = 0.0, to = Time.zone.now
  Time.at(from + rand * (to.to_f - from.to_f))
end

# rooms_path = Rails.root.join('db', 'seeds', 'rooms.yml')
# spaces_path = Rails.root.join('db', 'seeds', 'spaces.yml')
# tags_path = Rails.root.join('db', 'seeds', 'tags.yml')
# pdfs_path = Rails.root.join('db', 'seeds', 'pdfs.yml')

## Administrators
puts "  - Administrators"
Administrator.create({
  first_name: 'Canvas',
  last_name: 'Admin',
  email: 'admin@canvas.is',
  password: 'password',
  confirmed_at: Time.zone.now
})

# ## Rooms
# puts "  - Rooms"
# YAML.load_file(rooms_path).each do |params|
#   print '.'
#   room = Room.new({
#     name: params["name"],
#     description: params["description"],
#     room_type: params["room_type"],
#     position: params["position"],
#     amenities: params["amenities"]
#   })
#   3.times do |i|
#     room.room_images << room_image(i)
#   end
#   room.save
#   sleep 1
# end

# ## Offers
# puts "\n  - Offers"
# 5.times do |i|
#   print '.'
#   Offer.create({
#     name: Faker::Book.title,
#     price: '150.00',
#     content: list_items(5),
#     image: fetch_image,
#     icon: Offer::ICON_TYPES.sample,
#     availability_url: Faker::Internet.url,
#     status: nil,
#     published_at: nil,
#     on_offers_page: true,
#     on_rooms_page: i > 2 ? false : true,
#     nav_offer_type: i > 3 ? nil : i
#   })
# end

# ## Tags
# puts "\n  - Tags"
# YAML.load_file(tags_path).each do |params|
#   Tag.create({name: params["name"]})
# end

# ## Posts
# load(Rails.root.join('db', 'seeds', 'posts.rb'))

# ## Press
# load(Rails.root.join('db', 'seeds', 'press.rb'))

# ## Pdfs
# puts "\n  - Pdfs"
# YAML.load_file(pdfs_path).each do |params|
#   Pdf.create({
#     name: params["name"],
#     section: params["section"],
#     pdf_url: fetch_asset("https://www.acm.org/sigs/publications/sig-alternate.pdf")
#   })
# end

# ## Artist
# puts "  - Artist"

# Artist.create({
#   name: 'Jane Hammond',
#   description: 'has for over thirty years been re-contextualizing vernacular imagery, collaborating with the culture that surrounds her, reimagining the visual ephemera she collects. Her oeuvre spans painting, photography, installation and mixed media work. Her works are in many private and museum collections around the world. She lives and works in New York City.',
#   image: fetch_image,
#   poster: fetch_image,
#   video_url: 'https://player.vimeo.com/external/192557304.hd.mp4?s=883bdc3b163bf7e4665eef91629fafcef91b9695&profile_id=119'
#   })

# ## Dining
# Carousel.create({
#   name: 'Temple Court'
#   })
# Carousel.create({
#   name: 'The Bar Room'
#   })

# ## Spaces
# puts "  - Spaces"
# YAML.load_file(spaces_path).each do |params|
#   print '.'
#   space = Space.new({
#     name: params["name"],
#     description: params["description"],
#     details: params["details"]
#   })
#   # 3.times do |i|
#   #   space.space_images << space_image(i)
#   # end
#   space.save
#   sleep 1
# end
