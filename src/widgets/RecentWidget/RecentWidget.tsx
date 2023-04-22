import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { Image } from "@davatar/react";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { FixedSizeList as List } from "react-window";
import { AutoSizer } from "react-declarative";

import { labels } from './RecentWidget.constants';

const LIST_ITEM_HEIGHT = 72;
const LIST_MAX_LEN = Math.max(Math.floor(window.innerHeight / LIST_ITEM_HEIGHT), 25);

interface IItem {
  description: string;
  address: string;
}

const renderItem = (): IItem => ({
  address: faker.datatype.hexadecimal({
    length: 40,
    case: "lower",
  }),
  description: faker.helpers.arrayElement(labels),
});

const INITIAL_LIST = [...new Array(LIST_MAX_LEN)]
    .fill(0)
    .map(() => renderItem())

export const RecentWidget = () => {
  const [items, setItems] = useState<IItem[]>(INITIAL_LIST);

  useEffect(() => {
    const interval = setInterval(() => {
        setItems((items) => [renderItem(), ...items.slice(0, LIST_MAX_LEN - 1)])
    }, 5_000 + Math.random() * 1_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AutoSizer payload={items}>
      {({ height, width, payload }) => (
        <List
          height={height}
          width={width}
          itemCount={payload.length}
          itemSize={LIST_ITEM_HEIGHT}
          itemKey={(idx) => payload[idx].address}
        >
          {({ style, index: idx }) => (
            <ListItem key={payload[idx].address} style={style}>
              <ListItemAvatar>
                <Image address={payload[idx].address} size={40} />
              </ListItemAvatar>
              <ListItemText
                primary={payload[idx].address}
                secondary={<span
                    dangerouslySetInnerHTML={{
                        __html: payload[idx].description,
                    }}
                />}
              />
            </ListItem>
          )}
        </List>
      )}
    </AutoSizer>
  );
};

export default RecentWidget;
