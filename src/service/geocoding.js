function geocodeAddress(address) {
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK") {
        const { lat, lng } = results[0].geometry.location;
        resolve({ lat: lat(), lng: lng() });
      } else {
        reject(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  });
}

export { geocodeAddress };
