import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("adventure", "routes/adventure.tsx"),
  route("training", "routes/training.tsx"),
  route("bosses", "routes/bosses.tsx"),
  route("shop", "routes/shop.tsx"),
  route("play/:mode/:tabuada?", "routes/play.tsx"),
  route("collection", "routes/collection.tsx"),
] satisfies RouteConfig;
