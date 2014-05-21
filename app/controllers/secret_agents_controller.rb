class SecretAgentsController < ApplicationController
  before_action :set_secret_agent, only: [:show, :edit, :update, :destroy]

  # GET /secret_agents/near.json
  def near
    @secret_agents = geo_search_params_to_scope.where.not(id: current_secret_agent.id)
    render :index, :as => :json
  end

  def update_location
    @secret_agent = current_secret_agent

    puts "Update Location (1) #{@secret_agent.address} (#{@secret_agent.latitude} #{@secret_agent.longitude})"

    @secret_agent.update_attributes update_location_params

    puts "Update Location (2) #{@secret_agent.address} (#{@secret_agent.latitude} #{@secret_agent.longitude})"

    render :json => {}
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_secret_agent
    @secret_agent = SecretAgent.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def secret_agent_params
    params.require(:secret_agent).permit(:codename, :address, :latitude, :longitude)
  end

  def update_location_params
    params.require(:secret_agent).permit(:latitude, :longitude)
  end


  def geo_search_params_to_scope
    near_scope = SecretAgent.none
    defaults = {:miles => 20}
    search = defaults.merge(params.permit(:miles, :lat, :lng))
    search.symbolize_keys!

    if (search.has_key?(:lat) && search.has_key?(:lng))
      if (search[:miles] > 0)
        near_scope = SecretAgent.near([search[:lat], search[:lng]], search[:miles])
      end
    end
    near_scope
  end
end
