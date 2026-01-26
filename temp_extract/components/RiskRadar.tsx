
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RiskRadarProps {
  data: { subject: string; A: number; fullMark: number }[];
}

const RiskRadar: React.FC<RiskRadarProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            name="風險指標"
            dataKey="A"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskRadar;
