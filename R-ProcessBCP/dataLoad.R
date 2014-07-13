rm(list = ls())
setwd('/Users/zurich/Desktop/TRANSFER/GovtHack-Sydney/production/R-ProcessBCP')
library(reshape2)
library(ggplot2) 
library(plyr)
SA2data <- read.csv("2011Census_B13_NSW_SA2_short.csv", header = TRUE, stringsAsFactors = FALSE)
colNames <- read.csv("ColNames.csv", header = TRUE, stringsAsFactors = FALSE)
sydRegions <- read.csv("SydneyExport.csv", header = TRUE, stringsAsFactors = FALSE)
colNamesInterest <- subset(colNames, Gender == "All" & Component == "Yes")
easyReadingLanguageNames <- as.character(colNamesInterest$Language)

# get specific regions SA2data os 540 rows. dfSydney is 270. 151 columns
dfSydney <- SA2data[SA2data$region_id %in% sydRegions$SA2_MAIN,]

#get specific columns. Gone from 151 columns to 44 columsn
dfSydney <- dfSydney[, names(dfSydney) %in% colNamesInterest$colName]
#prettier names for languages
names(dfSydney) <- easyReadingLanguageNames
# club ids, idNames + data
dfSydney <- cbind(sydRegions[, 1:2], dfSydney)
# TEST for "Avoca..." sum(dfSydney[dfSydney$SA2_MAIN == 102011028, 3:46])
# TEST total population" sum(dfSydney[, 3:46])  ASSERT == 4291606

#Get summary language stuff about Sydney
langSums <- colSums(dfSydney[, -c(1,2)])
names(langSums) <- NULL
langNames <- names(dfSydney[-c(1,2)])
dfsummary <- data.frame(LangNames = langNames, values = langSums)
dfsummary <- dfsummary[order(-dfsummary$values),]

graphData <- dfsummary[3:nrow(dfsummary),]
pp <- ggplot(graphData, aes(x = factor(LangNames), y = values)) + geom_bar(stat = "identity")
pp <- pp + theme(axis.text.x = element_text(angle = 90, hjust = 1))
pp

#============================================
#MELT
#============================================
dfSydLong <- melt(dfSydney, id.vars = c("SA2_MAIN", "SA2_NAME"))
# CHECK dfSydLong[dfSydLong$SA2_MAIN == 102011028,]
# ASSERT  sum(dfSydLong[dfSydLong$SA2_MAIN == 102011028, "value"]) == 7009
#arab <- dfSydLong[dfSydLong$variable == "Arabic",]
#arabOrder <- arab[order(-arab$value),]



#ddply SUMMARIES
geoSummary <- ddply(dfSydLong, c("SA2_MAIN", "SA2_NAME"), summarise, totPop = sum(value))
#ASSERT sum(geoSummary$Total) == 4291606
engOnlySummary <- ddply(dfSydLong[dfSydLong$variable == "English Only",]
                        , c("SA2_MAIN"), summarise,  engOnly = sum(value))

NotStatedSummary <- ddply(dfSydLong[dfSydLong$variable == "Not Stated",]
                        , c("SA2_MAIN"), summarise,  notStated = sum(value))

ForeignSummary <- ddply(dfSydLong[!(dfSydLong$variable %in% c("Not Stated", "English Only")) ,]
                          , c("SA2_MAIN"), summarise,  foreign = sum(value))
#club the columns together
dfSumAll <- cbind(geoSummary, engOnly = engOnlySummary$engOnly, 
            notStated = NotStatedSummary$notStated, foreign = ForeignSummary$foreign)

dfSumAll$forPC <- dfSumAll$foreign / (dfSumAll$totPop - dfSumAll$notStated)
#clean up NAN
dfSumAll$forPC <- ifelse(is.na(dfSumAll$forPC), 0, dfSumAll$forPC)

dfSumAll <- dfSumAll[order(-dfSumAll$totPop),]

fnQuantile <- function(vctInput, intNumberDivisions) {
  #returns a factor. Slices up vctInput into intNumberDivisions. Each slice contains approx same number of observations
  vctDivisions <- seq(0,1, by = 1 / intNumberDivisions)
  vctQuantile <- quantile(vctInput, probs = vctDivisions)
  print(vctQuantile)
  vctFactor <- cut(vctInput, vctQuantile, labels = 1:intNumberDivisions, include.lowest=TRUE)
  return(vctFactor)
}

dfSumAll$bucket <- as.numeric(fnQuantile(dfSumAll$forPC, 6))
#hack to assign low pop areas 0 value for buck. 
dfSumAll$bucket <- ifelse(dfSumAll$totPop < 50, 0, dfSumAll$bucket)

# here we can do simple tests: nrow(dfSumAll[dfSumAll$bucket == 1,])
write.csv(dfSumAll, "sydRegions.csv", row.names=FALSE)



#Exclude these:
vctExclude <- c("English Only", "Not Stated", "Unclassified")

dfSydLong <- dfSydLong[!(dfSydLong$variable %in% vctExclude),]

write.csv(dfSydLong, "dfSydLong.csv", row.names=FALSE)

dfTopN <- ddply(dfSydLong, c("SA2_MAIN"), function(df) 
  head(df[order(df$value, decreasing = TRUE), ], 6))

write.csv(dfTopN, "dfTopN.csv", row.names=FALSE)










