rm(list = ls())
setwd('/Users/zurich/Desktop/TRANSFER/GovtHack-Sydney/production/R-ProcessTSP')
library(reshape2)
library(ggplot2)
library(plyr)
colNames <- read.csv("ColNames.csv", header = TRUE, stringsAsFactors = FALSE)
sydRegions  <- read.csv("SydneyExport.csv", header = TRUE, stringsAsFactors = FALSE)
SA2TSPA <- read.csv("2011Census_T10A_NSW_SA2_short.csv", header = TRUE, stringsAsFactors = FALSE)
SA2TSPB <- read.csv("2011Census_T10B_NSW_SA2_short.csv", header = TRUE, stringsAsFactors = FALSE)
# club the two data sets together.  We don't need region_id twice
SA2TSPB <- SA2TSPB[, -which(names(SA2TSPB) == "region_id")]
SA2TSP.COMP <- cbind(SA2TSPA, SA2TSPB)

dfSydney <- SA2TSP.COMP[SA2TSP.COMP$region_id %in% sydRegions$SA2_MAIN,]

#=================================
#Other includes "Not Stated" and "Overseas Visitors"
#This is 2001
colNames.2001.all <- colNames[colNames$TimePeriod == 2001 & colNames$Gender == "all" & colNames$Include == "YES" ,]
names.2001.all <- c("region_id", colNames.2001.all$ColumName)
dfSyd.2001.all <- dfSydney[, names(dfSydney) %in% names.2001.all]
#pretty names
read.names.2001.all <- c("id", colNames.2001.all$Language)
names(dfSyd.2001.all) <- read.names.2001.all
#get rid of subtotals
dfSyd.2001.all <- dfSyd.2001.all[, ! names(dfSyd.2001.all) %in% c("Total")]
#create column totals
dfSyd.2001.all.total <- rowSums(dfSyd.2001.all[, ! names(dfSyd.2001.all) %in% c("id")])
dfSyd.2001.all.foreign <- rowSums(dfSyd.2001.all[, ! names(dfSyd.2001.all) 
            %in% c("id", "English Only", "Not Stated", "Overseas Visitors")])
dfSyd.2001.all.other <- rowSums(dfSyd.2001.all[, names(dfSyd.2001.all) 
           %in% c("Not Stated", "Overseas Visitors")])
dfSyd.2001.all.english <- dfSyd.2001.all$"English Only"
#club together for 2001
dfSyd.2001.summary <- data.frame(id = dfSyd.2001.all$id, total.01 = dfSyd.2001.all.total, 
                                 foreign.01 = dfSyd.2001.all.foreign, 
                                 english.01 = dfSyd.2001.all.english, other01 = dfSyd.2001.all.other)
#=================================
#This is 2006
colNames.2006.all <- colNames[colNames$TimePeriod == 2006 & colNames$Gender == "all" & colNames$Include == "YES" ,]
names.2006.all <- c("region_id", colNames.2006.all$ColumName)
dfSyd.2006.all <- dfSydney[, names(dfSydney) %in% names.2006.all]

#pretty names
read.names.2006.all <- c("id", colNames.2006.all$Language)
names(dfSyd.2006.all) <- read.names.2006.all

#get rid of subtotals
dfSyd.2006.all <- dfSyd.2006.all[, ! names(dfSyd.2006.all) %in% c("Total")]
#create column totals
dfSyd.2006.all.total <- rowSums(dfSyd.2006.all[, ! names(dfSyd.2006.all) %in% c("id")])
dfSyd.2006.all.foreign <- rowSums(dfSyd.2006.all[, ! names(dfSyd.2006.all) 
          %in% c("id", "English Only", "Not Stated", "Overseas Visitors")])
dfSyd.2006.all.other <- rowSums(dfSyd.2006.all[, names(dfSyd.2006.all) 
                  %in% c("Not Stated", "Overseas Visitors")])
dfSyd.2006.all.english <- dfSyd.2006.all$"English Only"
#club together for 2006
dfSyd.2006.summary <- data.frame(id = dfSyd.2006.all$id, total.06 = dfSyd.2006.all.total, 
                                 foreign.06 = dfSyd.2006.all.foreign, 
                                 english.06 = dfSyd.2006.all.english, other06 = dfSyd.2006.all.other)

#=================================
#This is 2011
colNames.2011.all <- colNames[colNames$TimePeriod == 2011 & colNames$Gender == "all" & colNames$Include == "YES" ,]
names.2011.all <- c("region_id", colNames.2011.all$ColumName)
dfSyd.2011.all <- dfSydney[, names(dfSydney) %in% names.2011.all]

#pretty names
read.names.2011.all <- c("id", colNames.2011.all$Language)
names(dfSyd.2011.all) <- read.names.2011.all

#get rid of subtotals
dfSyd.2011.all <- dfSyd.2011.all[, ! names(dfSyd.2011.all) %in% c("Total")]

dfSyd.2011.all.total <- rowSums(dfSyd.2011.all[, ! names(dfSyd.2011.all) %in% c("id")])
dfSyd.2011.all.foreign <- rowSums(dfSyd.2011.all[, ! names(dfSyd.2011.all) 
            %in% c("id", "English Only", "Not Stated", "Overseas Visitors")])

dfSyd.2011.all.other <- rowSums(dfSyd.2011.all[, names(dfSyd.2011.all) 
                                               %in% c("Not Stated", "Overseas Visitors")])

dfSyd.2011.all.english <- dfSyd.2011.all$"English Only"

dfSyd.2011.summary <- data.frame(id = dfSyd.2011.all$id, total.11 = dfSyd.2011.all.total, 
                                 foreign.11 = dfSyd.2011.all.foreign, 
                                 english.11 = dfSyd.2011.all.english, other.11 = dfSyd.2011.all.other)
#==========FINISH FOR 01, 06, 11 Summaries.
dfDec <- dfSyd.decade.summary <- cbind(dfSyd.2001.summary, 
                                       dfSyd.2006.summary[2:ncol(dfSyd.2006.summary)],
                                       dfSyd.2011.summary[2:ncol(dfSyd.2011.summary)])



dfDecPC <- data.frame(id =  dfDec$id, tot01Cln = dfDec$total.01 - dfDec$other01, 
        tot06Cln =  dfDec$total.06 - dfDec$other06, tot11Cln =  dfDec$total.11 - dfDec$other.11)

dfDecPC$totChange.06 <- round(((dfDecPC$tot06Cln - dfDecPC$tot01Cln) / dfDecPC$tot01Cln) *100,2)
dfDecPC$engChange.06 <- round(((dfDec$english.06 - dfDec$english.01) / dfDecPC$tot01Cln) * 100,2)
dfDecPC$forChange.06 <- round(((dfDec$foreign.06 - dfDec$foreign.01) / dfDecPC$tot01Cln) * 100,2)

dfDecPC$totChange.11 <- round(((dfDecPC$tot11Cln - dfDecPC$tot01Cln) / dfDecPC$tot01Cln) *100,2)
dfDecPC$engChange.11 <- round(((dfDec$english.11 - dfDec$english.01) / dfDecPC$tot01Cln) * 100,2)
dfDecPC$forChange.11 <- round(((dfDec$foreign.11 - dfDec$foreign.01) / dfDecPC$tot01Cln) * 100,2)

dfDecPC$relevant <- ifelse(dfDecPC$tot01Cln < 1000, 1, 0)
#set all NAN / inf to zero
dfDecPC$totChange.06 <- ifelse(dfDecPC$tot01Cln < 1000, 0, dfDecPC$totChange.06)
dfDecPC$engChange.06 <- ifelse(dfDecPC$tot01Cln < 1000, 0, dfDecPC$engChange.06)
dfDecPC$forChange.06 <- ifelse(dfDecPC$tot01Cln < 1000, 0, dfDecPC$forChange.06)

dfDecPC$totChange.11 <- ifelse(dfDecPC$tot01Cln < 1000, 0, dfDecPC$totChange.11)
dfDecPC$engChange.11 <- ifelse(dfDecPC$tot01Cln < 1000, 0, dfDecPC$engChange.11)
dfDecPC$forChange.11 <- ifelse(dfDecPC$tot01Cln < 1000, 0, dfDecPC$forChange.11)
write.csv(dfDecPC, "tsp.csv", row.names=FALSE)

test <- dfDecPC[, 5:10]
maxDec <- apply(test, 1, function(x) max(x))
minDec <- apply(test, 1, function(x) min(x))

testAbs <- abs(test)
maxAbs <- apply(testAbs, 1, function(x) max(x))




