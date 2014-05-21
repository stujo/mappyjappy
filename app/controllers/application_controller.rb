class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_filter do
    ensure_secret_agent
  end

  def current_secret_agent
    @secret_agent
  end

  def ensure_secret_agent
    if cookies[:codename]
       @secret_agent = SecretAgent.find_or_create_by(:codename => cookies[:codename])
    else
      @secret_agent = SecretAgent.create()
      cookies[:codename] = @secret_agent.codename
    end
  end
end
