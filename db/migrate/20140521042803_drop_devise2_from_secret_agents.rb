class DropDevise2FromSecretAgents < ActiveRecord::Migration
  def change
    remove_column :secret_agents, :last_sign_in_ip
    remove_column :secret_agents, :current_sign_in_ip
  end
end
