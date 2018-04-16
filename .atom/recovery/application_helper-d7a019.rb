# frozen_string_literal: true
module ApplicationHelper
  def body_class(text)
    content_for :body_class, text
  end

  def title(text)
    content_for :title, text
  end

  def meta_tag(tag, text)
    content_for :"meta_#{tag}", text.html_safe
  end

  def yield_meta_tag(tag, default_text='')
    content_for?(:"meta_#{tag}") ? content_for(:"meta_#{tag}") : default_text
  end

  def yield_title_tag(default_text = 'Dataminr')
    content_for?(:title) ? content_for(:title) : default_text
  end

  def format_date(datetime)
    datetime.strftime("%b, %d %Y")
  end

  def text_date(datetime)
    datetime.strftime('%B %-d, %Y')
  end

  def format_time(datetime)
    datetime.strftime("%l:%M %p")
  end

  def strip_html_from_meta_tag(description)
    strip_tags(description).gsub(/\r\n?/, '').truncate(160)
  end

  def strip_html_from_description(description, count)
    strip_tags(description).gsub(/\r\n?/, '').truncate(count)
  end

  def featured_content_path(object)
    # @featured_class = @featured_content[object].class
    # if @featured_class == Event
    #   "http://#{@featured_content[object].button_url}"
    # elsif @featured_class == Press
    #   press_path(@featured_content[object].slug)
    # elsif @featured_class == Resource
    #   resource_path(@featured_content[object].slug)
    # else
    #   case_study_path(@featured_content[object].slug)
    # end
    # @featured_class = content
    # if @featured_class == Event
    #   "http://#{object.button_url}"
    # elsif @featured_class == Press
    #   press_path(object.slug)
    # elsif @featured_class == Resource
    #   resource_path(object.slug)
    # else
    #   case_study_path(object.slug)
    # end
    @featured_class = object.class
    if @featured_class == Event
      "http://#{object.button_url}"
    elsif @featured_class == Press
      press_path(object.slug)
    elsif @featured_class == Resource
      resource_path(object.slug)
    else
      case_study_path(object.slug)
    end
  end

  def nav_featured_content_path(object)
    @featured_class = @nav_featured_content[object].class
    if @featured_class == Event
      "http://#{@nav_featured_content[object].button_url}"
    elsif @featured_class == Press
      press_path(@nav_featured_content[object].slug)
    elsif @featured_class == Resource
      resource_path(@nav_featured_content[object].slug)
    else
      case_study_path(@nav_featured_content[object].slug)
    end
  end

  def hero_link_path(hero)
    hero_class = hero.class
    if hero_class == Event
      "http://#{hero.button_url}"
    elsif hero_class == Press
      press_path(hero.slug)
    elsif hero_class == Resource
      resource_path(hero.slug)
    else
      case_study_path(hero.slug)
    end
  end

  def panel_converter(panel_type)
    if panel_type == 'PanelTemplateA'
      '3 Column Text'
    elsif panel_type == 'PanelTemplateB'
      '3 Column Image'
    elsif panel_type == 'PanelTemplateC'
      'Full Width Image'
    elsif panel_type == 'PanelTemplateD'
      'Quote'
    elsif panel_type == 'PanelTemplateF'
      'Article'
    else
      'Timeline'
    end
  end

  def primary_tag(object)
    # @featured_content[object].class == CaseStudy ? 'Case Study' : @featured_content[object].tag
    object.class == CaseStudy ? 'Case Study' : object.tag
  end

  def nav_tag(object)
    @nav_featured_content[object].class == CaseStudy ? 'Case Study' : @nav_featured_content[object].tag
  end

  # target is array to merge source into with the
  # count of items in target between source items
  # i.e. target = [1, 2, 3, 4, 5]; source = ['a', 'b', 'c']
  # merge_every(target, source, 2)
  #   => [1, 2, 'a', 3, 4, 'b', 5]
  # merge_every(target, source, 3)
  #   => [1, 2, 3, 'a', 4, 5]
  def merge_every(target, source, count = 4)
    target_length = target.length
    sliced_source = source.slice(0, target_length / count)

    sliced_source.each_with_index.reduce([]) do |acc, (cur, i)|
      acc.concat(target.slice(i * count, count)).concat([cur])
    end.concat(target.slice(sliced_source.length * count, target_length) || [])
  end
end
