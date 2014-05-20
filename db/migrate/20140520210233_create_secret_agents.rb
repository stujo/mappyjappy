class CreateSecretAgents < ActiveRecord::Migration
  def change
    create_table :secret_agents do |t|
      t.string :codename
      t.string :address
      t.float :latitude
      t.float :longitude

      t.timestamps
    end
  end
end
