Rails.application.routes.draw do
  mount RedactorDragonfly::Engine => '/redactor_dragonfly'
  mount_roboto

  get '/' => 'pages#homepage', as: :homepage

  resources :rooms, only: [:index, :show]

  get '/offers/featured' => 'offers#featured', as: :featured_offer

  resources :offers, only: [:index, :show]

  resources :posts, only: [:index, :show], path: 'culture'

  resources :press, only: :index

  # Custom route to go directly to 'suites' section of /rooms
  get '/suites', to: redirect('/rooms#suites')

  resources :landing_pages, path: '/page', only: :show

  # GET static pages
  get '/hotel'                             => 'pages#hotel', as: :hotel

  get '/eat-and-drink'                     => 'pages#eat_and_drink', as: :eat_and_drink

  get '/temple-court'                      => 'pages#temple_court', as: :temple_court

  get '/events'                            => 'pages#events', as: :events

  get '/offer-landing'                     => 'pages#offer_landing', as: :offer_landing

  get '/culture-landing'                   => 'pages#culture_landing', as: :culture_landing

  get '/faq'                               => 'pages#faq', as: :faq

  get '/privacy-policy'                    => 'pages#privacy_policy', as: :privacy_policy

  get '/press'                             => 'pages#press', as: :press

  get '/neighborhood'                      => 'pages#neighborhood', as: :neighborhood

  get '/the-bar-room'                      => 'pages#the_bar_room', as: :the_bar_room

  get '/temple-court-booking'              => 'pages#temple_booking'
end
