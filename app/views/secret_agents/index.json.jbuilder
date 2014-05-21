json.array!(@secret_agents) do |secret_agent|
  json.extract! secret_agent, :id, :codename, :address, :latitude, :longitude
end
