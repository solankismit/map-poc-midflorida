import React, { useEffect, useRef, useState } from "react";
import EventBus from "../../EventBus";
import { useData } from "../../DataContext";

export default function DataComponent() {
  const { data } = useData();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItemRef = useRef(null);

  const [openCardIndex, setOpenCardIndex] = useState(null);

  const handleItemClick = (id) => {
    setSelectedItemId(id);
    EventBus.emit("listItemClicked", id);
  };

  const handleMarkerClick = (id = 0) => {
    if (id === 0) {
      setSelectedItemId(null);
      return;
    }
    setSelectedItemId(id);
    setOpenCardIndex(data?.findIndex((item) => item.id === id));
  };
  useEffect(() => {
    if (selectedItemRef.current) {
      setOpenCardIndex(data?.findIndex((item) => item.id === selectedItemId));
      selectedItemRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedItemId]);
  useEffect(() => {
    EventBus.on("markerClicked", handleMarkerClick);

    return () => {
      EventBus.off("markerClicked", handleMarkerClick);
    };
  }, []);

  return (
    <div className="data-component">
      <div className="data-items">
        {data?.map((item, idx) =>
          DataItem({
            idx,
            item,
            selectedItemId,
            selectedItemRef,
            openCardIndex,
            onClick: () => {
              handleItemClick(item.id);
              setOpenCardIndex(openCardIndex === idx ? null : idx);
            },
          })
        )}
      </div>
    </div>
  );
}
const Icon = ({ name, className }) => {
  return (
    <img
      src={`public/assets/images/Icon/location/${name}.png`}
      className={className}
      alt={name}
    />
  );
};
const DataItem = ({
  idx,
  item,
  selectedItemId,
  selectedItemRef,
  openCardIndex,
  onClick,
}) => {
  return (
    <div
      key={item.id}
      ref={selectedItemId === item.id ? selectedItemRef : null}
      className={`data-item  ${selectedItemId === item.id ? "selected" : ""}`}
      onClick={onClick}
    >
      {/* <div className="weather ">
        <span className="weather-text s-body">
          <Icon name="thunderstorm" />
          Storm Hour Updates - Open until 2PM
        </span>
        <a href="#" className="weather-link m-body">
          <span>Read More</span> <Icon name="arrow-white" />
        </a>
      </div> */}
      {JSON.parse(item.locationCardContent)?.locationAlert?.alertMessage && (
        <div className="weather ">
          <span className="weather-text s-body">
            <Icon name="thunderstorm" />
            {JSON.parse(item.locationCardContent)?.locationAlert?.alertMessage}
          </span>
          {JSON.parse(item.locationCardContent)?.locationAlert?.alertLink && (
            <a
              href={
                JSON.parse(item.locationCardContent)?.locationAlert?.alertLink
              }
              className="weather-link m-body"
            >
              <span>Read More</span> <Icon name="arrow-white" />
            </a>
          )}
        </div>
      )}
      <div className="branch-details">
        <div className="categories s-body">
          <p>{item?.locationTypeList?.join(" | ")}</p>
          <div className="branch-img">
            <img src="midflorida-img.png" alt="" />
          </div>
        </div>
        <div className="branch-name ">
          <span>{idx + 1}</span>
          <p className="branch-name--title l-body">{item?.locationName}</p>
        </div>

        <p className="address m-body">
          {item?.address} {item?.zipcode}
        </p>
      </div>

      {(JSON.parse(item.locationCardContent)?.lobbyHours?.length > 0 ||
        JSON.parse(item.locationCardContent)?.drivethruHours?.length > 0 ||
        item?.locationFeatureList?.length > 0) && (
        <>
          <div className="card">
            <div className="dropdown s-body">
              <span>{openCardIndex === idx ? "Hide" : "Branch Hours"}</span>
              <Icon
                name={`arrow-up`}
                className={`icon ${openCardIndex === idx ? "opened" : ""}`}
              />
            </div>
            {openCardIndex === idx && JSON.parse(item.locationCardContent) && (
              <>
                <div className="dropdown-content">
                  {JSON.parse(item.locationCardContent)?.lobbyHours?.length >
                    0 && (
                    <div className="branch-hours">
                      <h3 className="s-label">Lobby</h3>
                      <ul className="s-body">
                        {JSON.parse(item.locationCardContent)?.lobbyHours?.map(
                          (hour) => (
                            <li
                              key={hour.dayOfWeek}
                            >{`${hour.dayOfWeek}: ${hour.hours}`}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {JSON.parse(item.locationCardContent)?.drivethruHours
                    ?.length > 0 && (
                    <div className="branch-hours">
                      <h3 className="s-label">Drive-Thru</h3>
                      <ul className="s-body">
                        {JSON.parse(
                          item.locationCardContent
                        )?.drivethruHours?.map((hour) => (
                          <li
                            key={hour.dayOfWeek}
                          >{`${hour.dayOfWeek}: ${hour.hours}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item?.locationFeatureList?.length > 0 && (
                    <div className="features">
                      <h3 className="s-label">Features</h3>
                      <ul className="s-body">
                        {item?.locationFeatureList?.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
      <div className="place">
        {item?.distance && (
          <span className="s-body place-distance">{item.distance} miles |</span>
        )}
        <a
          href={`http://maps.google.com/maps?q=${item?.latitude},${item?.longitude}`}
          className="m-body place-direction"
        >
          <Icon name={"location"} />
          Get Directions
        </a>
        <a href={item?.url} className="m-body place-details">
          <Icon name={"info"} />
          View Details
        </a>
        {item?.isAccessible && (
          <a className="m-body place-wheel-chair">
            <Icon name={"wheelchair"} />
          </a>
        )}
      </div>
    </div>
  );
};
