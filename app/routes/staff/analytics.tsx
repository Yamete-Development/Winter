import { Typography, Card } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

export default function StaffAnalytics() {
  const dates = Array.from({ length: 7 }).map((_, i) => dayjs().subtract(6 - i, "day").format("MMM D"));
  const data = [120, 150, 180, 210, 240, 290, 320];

  const options = {
    chart: { type: "areaspline", backgroundColor: "transparent" },
    title: { text: "Messages Sent Over Time", style: { color: "#fff" } },
    xAxis: { categories: dates, labels: { style: { color: "#a0a0a0" } } },
    yAxis: { title: { text: "Messages" }, labels: { style: { color: "#a0a0a0" } }, gridLineColor: "#303030" },
    legend: { itemStyle: { color: "#fff" } },
    series: [
      {
        name: "Messages",
        data: data,
        color: "#1677ff",
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "rgba(22, 119, 255, 0.5)"],
            [1, "rgba(22, 119, 255, 0.05)"],
          ],
        },
      },
    ],
  };

  return (
    <div>
      <Title level={2}>System Analytics</Title>
      <Paragraph>Review system performance and metrics.</Paragraph>
      <Card bodyStyle={{ padding: 24 }}>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Card>
    </div>
  );
}
