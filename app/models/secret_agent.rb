class SecretAgent < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  geocoded_by :address # can also be an IP address
  reverse_geocoded_by :latitude, :longitude
  after_validation :geocode
  after_validation :reverse_geocode # auto-fetch address

  # auto-fetch address
  after_validation :reverse_geocode, if: ->(obj) {
    obj.latitude.present? and obj.latitude_changed? and
        obj.longitude.present? and obj.longitude_changed?
  }

  before_validation :ensure_codename


  def ensure_codename
    self.codename = SecureRandom.hex(6) unless self.codename
  end
end
