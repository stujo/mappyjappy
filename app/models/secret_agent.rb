class SecretAgent < ActiveRecord::Base

  geocoded_by :address # can also be an IP address
  reverse_geocoded_by :latitude, :longitude
  after_validation :geocode
  after_validation :reverse_geocode # auto-fetch address

  # auto-fetch address
  after_validation :reverse_geocode, if: ->(obj) {
    obj.latitude.present? and obj.latitude_changed? and
        obj.longitude.present? and obj.longitude_changed?
  }
end
