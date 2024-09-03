export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  const distanceInMiles = Math.floor(distance / 1.609);
  return distanceInMiles;
}

export const updateData = async ({ selectedPlace, distance, categories }) => {
  try {
    const dataApiUrl1 = import.meta.env.VITE_DATA_API_URL;
    const dataApiUrl2 = import.meta.env.VITE_DATA_API_URL_2;
    const response1 = await fetch(dataApiUrl1, { method: "GET" });
    let data1 = await response1.json();

    if (data1) {
      // Filter data based on distance
      data1 = data1.filter((item) => {
        let distanceFilter = true;
        // Calculate distance between item and selected place
        if (typeof distance === "number" && distance > 0) {
          const calculatedDistance = calculateDistance(
            item.location[0],
            item.location[1],
            selectedPlace.geometry.location.lat,
            selectedPlace.geometry.location.lng
          );
          distanceFilter = calculatedDistance < distance;
        }

        //  Add filter for Categories
        let categoryFilter = true;
        if (categories.length > 0) {
          categoryFilter = categories.includes(item.category);
        }

        return distanceFilter && categoryFilter;
      });

      const response2 = await fetch(dataApiUrl2 + "/data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: data1 }),
      });

      if (response2.status === 200) {
        // console.log("Data updated successfully");
        return data1;
      } else {
        console.error("Error updating data:", response2.statusText);
      }
    }
  } catch (error) {
    console.error("Error fetching or updating data:", error);
  }
};



