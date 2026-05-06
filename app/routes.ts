import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("adventure", "routes/adventure.tsx"),
  route("training", "routes/training.tsx"),
  route("bosses", "routes/bosses.tsx"),
  route("shop", "routes/shop.tsx"),
  route("play/:mode/:tabuada?", "routes/play.tsx"),
  route("collection", "routes/collection.tsx"),
  route("escola", "routes/escola.tsx"),
  route("escola/multiplos", "routes/escola-multiplos.tsx"),
  route("escola/fracoes", "routes/escola-fracoes.tsx"),
  route("escola/sequencia", "routes/escola-sequencia.tsx"),
  route("escola/probabilidades", "routes/escola-probabilidades.tsx"),
] satisfies RouteConfig;
