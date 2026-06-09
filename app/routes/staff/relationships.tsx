import { Typography, Card } from "antd";
import CytoscapeComponent from "react-cytoscapejs";
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;

export default function StaffRelationships() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Mock data for cytoscape
    setElements([
      { data: { id: "hub1", label: "Global Lounge" }, classes: "hub" },
      { data: { id: "srv1", label: "Gaming Bros" } },
      { data: { id: "srv2", label: "Study Group" } },
      { data: { id: "srv3", label: "Anime Club" } },
      { data: { source: "hub1", target: "srv1" } },
      { data: { source: "hub1", target: "srv2" } },
      { data: { source: "hub1", target: "srv3" } },
    ] as any);
  }, []);

  return (
    <div>
      <Title level={2}>Hub-Server Relationships</Title>
      <Paragraph>Visualize how servers are connected to Interchat Hubs using Cytoscape.js.</Paragraph>
      <Card bodyStyle={{ padding: 0, height: 500 }}>
        {elements.length > 0 && (
          <CytoscapeComponent
            elements={elements}
            style={{ width: "100%", height: "100%" }}
            layout={{ name: "cose" }}
            stylesheet={[
              {
                selector: "node",
                style: {
                  "background-color": "#1677ff",
                  label: "data(label)",
                  color: "#fff",
                  "text-outline-color": "#1677ff",
                  "text-outline-width": 2,
                },
              },
              {
                selector: "node.hub",
                style: {
                  "background-color": "#722ed1",
                  "text-outline-color": "#722ed1",
                  shape: "hexagon",
                  width: 50,
                  height: 50,
                },
              },
              {
                selector: "edge",
                style: {
                  width: 3,
                  "line-color": "#303030",
                  "target-arrow-color": "#303030",
                  "target-arrow-shape": "triangle",
                  "curve-style": "bezier",
                },
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
