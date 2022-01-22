import { IconButton, Grid, Typography, Card, CardContent, Chip } from "@mui/material"
import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import DashboardMode from "../../commons/configs/DashboardMode"
import IArticle from "../../commons/interfaces/IArticle"
import SentimentPieChart from "../chart/SentimentPieChart"
import SubjectivityPieChart from "../chart/SubjectivityPieChart"

interface IProps {
  article: IArticle
  setMode: (mode: string) => void
}

function FullDashboard(props: IProps): JSX.Element {
  const { article, setMode } = props

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        zIndex: 2147483647,
        backgroundColor: "white",
        overflowY: "scroll",
        overflowX: "hidden",
        padding: "50px",
      }}
    >
      <IconButton
        color="primary"
        onClick={() => setMode(DashboardMode.Partial)}
        sx={{
          position: "absolute",
          top: "2.5%",
          right: "2.5%",
        }}
      >
        <CloseIcon />
      </IconButton>

      <Grid
        container
        spacing={3}
        alignItems="center"
        sx={{
          marginTop: "2.5%%",
          textAlign: "center",
          paddingLeft: "17.5%",
          paddingRight: "17.5%",
        }}
      >
        <Grid item xs={12}>
          <DashboardCard>
            <Typography variant="h5" gutterBottom>
              Summary
            </Typography>
            
            <Typography variant="body2">
              {article.summarySentences.map((sentence, index) => {
                return (
                  <Typography
                    paragraph
                    gutterBottom
                    key={index}
                  >
                    • {sentence}
                  </Typography>
                )
              })}
            </Typography>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard>
            <Typography variant="h5" gutterBottom>
              Overview
            </Typography>
            
            <Typography variant="body2">
              <Typography paragraph gutterBottom>
                Read time: {article.meta.readTime}
              </Typography>

              <Typography paragraph gutterBottom>
                Read complexity: {article.meta.readComplexity}
              </Typography>

              <Typography paragraph gutterBottom>
                Char count: {article.meta.charCount}
              </Typography>

              <Typography paragraph gutterBottom>
                Sentence count: {article.meta.sentenceCount}
              </Typography>
            </Typography>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard>
            <Typography variant="h5" gutterBottom>
              Keywords
            </Typography>

            <>
              {article.keywords.map((keyword) => {
                return (
                  <Chip
                    key={keyword}
                    label={keyword}
                    color="primary"
                    sx={{
                      margin: "2px",
                      color: "white",
                      fontWeight: "bold",
                    }}  
                  />
                )
              })}
            </>
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard>
            <Typography variant="h5" gutterBottom>
              Sentiment (Sentences)
            </Typography>
            
            <SentimentPieChart
              chartData={article.sentimentPieChart}
            />
          </DashboardCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard>
            <Typography variant="h5" gutterBottom>
              Subjectivity (Sentences)
            </Typography>
            
            <SubjectivityPieChart
              chartData={article.subjectivityPieChart}
            />
          </DashboardCard>
        </Grid>
      </Grid>
    </div>
  )
}

function DashboardCard({ children }: any): JSX.Element {
  return (
    <Card
      sx={{
        minWidth: 275,
        minHeight: 225,
        textAlign: "left",
      }}
    >
      <CardContent>
       {children}
      </CardContent>
    </Card>
  )
}

export default FullDashboard
