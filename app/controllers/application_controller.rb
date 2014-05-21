class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_filter do
    fail "bad ancestor" unless self.kind_of?(Devise::Controllers::Helpers)
    fail "no mapping" unless Devise.class_variable_get(:@@mappings)[:secret_agent]
    authenticate_secret_agent!
  end
end
