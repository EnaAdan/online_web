import React from "react";
import { Grid, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const cards = [
  { title:"Apartments", path:"/apartments" },
  { title:"Add Apartment", path:"/apartments/add" },
  { title:"Identification Approvals", path:"/approvals/identifications" },
  { title:"Visitor Approvals", path:"/approvals/visitors" },
  { title:"Material Requests", path:"/approvals/materials" },
  { title:"Post Notice", path:"/notice" },
  { title:"Rental Report", path:"/reports/rentals" },
];

export default function Dashboard() {
  const nav = useNavigate();
  return (
    <Grid container spacing={2}>
      {cards.map((c)=>(
        <Grid key={c.path} item xs={12} sm={6} md={4}>
          <Card>
            <CardActionArea onClick={()=>nav(c.path)}>
              <CardContent>
                <Typography variant="h6">{c.title}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
