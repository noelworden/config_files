class ResourcesController < ApplicationController
  include ApplicationHelper

  before_action :authenticate_administrator!, only: :preview
  before_action :set_resource, only: [:show, :preview]
  before_action :resource_hero_content, only: :index

  def index
    if params[:tag] || params[:solution]
      filter_params
    else
      first_combo = (Resource.published_ordered + CaseStudy.published_ordered).sort_by! { |item| item.custom_published_date }.reverse
      @resources = Kaminari.paginate_array(merge_every(first_combo, Promo.published_ordered.reverse.to_a)).page params[:page]
    end

    respond_to do |format|
      format.json { render json: @resources }
      format.html
    end
  end

  def show
    render file: "#{Rails.root}/public/404.html", status: :not_found, layout: false unless @resource.is_published?
    @more_resources = get_resources(@resource)
  end

  def preview
    render :show
  end

  def filter_params
    promos = Promo.published_ordered.reverse.to_a

    @resources =  if params[:tag] == 'Case Study'
                    if params[:solution].present?
                      Kaminari.paginate_array(merge_every(CaseStudy.published_ordered.joins(:solutions).where({ solutions: { name: params[:solution] } }).to_a, promos)).page params[:page]
                    else
                      Kaminari.paginate_array(merge_every(CaseStudy.published_ordered.to_a, promos)).page params[:page]
                    end
                  elsif params[:tag] && params[:solution]
                    Kaminari.paginate_array(merge_every(Resource.published_ordered.where(tag: params[:tag]).joins(:solutions).where({ solutions: { name: params[:solution] } }).to_a, promos)).page params[:page]
                  elsif params[:tag]
                    Kaminari.paginate_array(merge_every(Resource.published_ordered.where(tag: params[:tag]).to_a, promos)).page params[:page]
                  else
                    resources = Resource.published_ordered.joins(:solutions).where({ solutions: { name: params[:solution] } })
                    case_studies = CaseStudy.published_ordered.joins(:solutions).where({ solutions: { name: params[:solution] } })
                    sorted_items = (resources + case_studies).sort_by! { |item| item.custom_published_date }.reverse
                    Kaminari.paginate_array(merge_every(sorted_items, promos)).page params[:page]
                  end
  end

  private

  def set_resource
    @resource = Resource.find(params[:id])
  end

  def resource_hero_content
    hero = FeaturedContent.find(41)
    @resource_hero_content = hero.featurable_type.constantize.find(hero.featurable_id)
  end

  def get_resources(resource)
    solution_ids = resource.solutions.pluck(:id)
    resource_tag = resource.tag

    resources = Resource.includes(:solutions)
                        .where(tag: resource_tag)
                        .where.not(id: resource.id)
                        .select { |base| base.solutions.pluck(:id) == solution_ids }

    if resources.count < 4
      resources + Resource.includes(:solutions)
                          .where(solutions: { id: solution_ids })
                          .where.not(id: resource.id)
                          .sample(4)
    else
      resources.sample(4)
    end
  end
end
