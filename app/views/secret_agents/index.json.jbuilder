json.array!(@secret_agents) do |secret_agent|
  json.extract! secret_agent, :id, :codename, :address, :latitude, :longitude
  json.url secret_agent_url(secret_agent, format: :json)
end
