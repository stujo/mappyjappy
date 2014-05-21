class DropDeviseFromSecretAgents < ActiveRecord::Migration
  def change

    remove_column :secret_agents, :email
    remove_column :secret_agents, :encrypted_password
    remove_column :secret_agents, :reset_password_token
    remove_column :secret_agents, :reset_password_sent_at
    remove_column :secret_agents, :remember_created_at
  end
end
