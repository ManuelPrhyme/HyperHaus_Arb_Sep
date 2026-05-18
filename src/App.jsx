import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  // Dashboard,
  GuildDetails,
  GuildLayout,
  Guilds,
  Home,
  LandingLayout,
  Leaderboard,
  Reward,
  Swap,
  Trade,
} from "./pages";
import { PageNotFound, ProtectedRoute } from "./components";

const routes = [
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/guilds",
        element: <GuildLayout />,
        children: [
          { index: true, element: <Guilds /> },
          { path: ":guildId", element: <GuildDetails /> },
          { path: "reward", element: <Reward /> },
          { path: "swap", element: <Swap /> },
          { path: "leaderboard", element: <Leaderboard /> },
        ],
      },
      {
        path: "/guilds/trade",
        element: <Trade />,
      },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
