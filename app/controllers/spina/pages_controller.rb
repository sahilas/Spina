class Spina::PagesController < Spina::ApplicationController
  include Spina::Frontend

  skip_before_action :authenticate_user!
  before_action :authorize_page

  helper_method :page

  def homepage
    render_with_template(page)
  end

  private

  def authorize_page
    raise ActiveRecord::RecordNotFound unless page.live?
  end
end