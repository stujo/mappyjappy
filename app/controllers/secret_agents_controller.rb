class SecretAgentsController < ApplicationController
  before_action :set_secret_agent, only: [:show, :edit, :update, :destroy]

  # GET /secret_agents
  # GET /secret_agents.json
  def index
    @secret_agents = SecretAgent.all
  end

  # GET /secret_agents/1
  # GET /secret_agents/1.json
  def show
  end

  # GET /secret_agents/new
  def new
    @secret_agent = SecretAgent.new
  end

  # GET /secret_agents/1/edit
  def edit
  end

  # POST /secret_agents
  # POST /secret_agents.json
  def create
    @secret_agent = SecretAgent.new(secret_agent_params)

    respond_to do |format|
      if @secret_agent.save
        format.html { redirect_to @secret_agent, notice: 'Secret agent was successfully created.' }
        format.json { render :show, status: :created, location: @secret_agent }
      else
        format.html { render :new }
        format.json { render json: @secret_agent.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /secret_agents/1
  # PATCH/PUT /secret_agents/1.json
  def update
    respond_to do |format|
      if @secret_agent.update(secret_agent_params)
        format.html { redirect_to @secret_agent, notice: 'Secret agent was successfully updated.' }
        format.json { render :show, status: :ok, location: @secret_agent }
      else
        format.html { render :edit }
        format.json { render json: @secret_agent.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /secret_agents/1
  # DELETE /secret_agents/1.json
  def destroy
    @secret_agent.destroy
    respond_to do |format|
      format.html { redirect_to secret_agents_url, notice: 'Secret agent was successfully destroyed.' }
      format.json { head :no_content }
    end
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
end
