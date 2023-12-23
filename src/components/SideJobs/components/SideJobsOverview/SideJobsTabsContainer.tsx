import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SideJob, SideJobSearch } from '@state/sideJobs';
import { IComponentWithGameStateManagerProps } from '@components/common';
import { SideJobTabs, TabsChangeCallback } from './types';

interface ISideJobsTabs extends IComponentWithGameStateManagerProps {
  selectedTab: SideJobTabs;
  onSelectTab: TabsChangeCallback;
}

const SideJobsTabsContainer = observer((props: ISideJobsTabs) => {
  const { gameStateManager, selectedTab, onSelectTab } = props;
  const { t } = useTranslation();

  const activeSideJobSearchesCount = React.useMemo<number>(() => {
    return gameStateManager.crewState.activitiesInProcess.reduce((count, activity) => {
      return activity instanceof SideJobSearch ? count + 1 : count;
    }, 0);
  }, [gameStateManager.crewState.activitiesInProcess]);

  const activeSideJobsCount = React.useMemo<number>(() => {
    return gameStateManager.crewState.activitiesInProcess.reduce((count, activity) => {
      return activity instanceof SideJob ? count + 1 : count;
    }, 0);
  }, [gameStateManager.crewState.activitiesInProcess]);

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Tabs value={selectedTab} onChange={onSelectTab}>
        <Tab
          value={SideJobTabs.Searches}
          label={t(
            'sideJobs.sideJobSearches',
            {
              ns: 'ui',
              active: activeSideJobSearchesCount,
              total: gameStateManager.sideJobState.sideJobSearches.length,
            },
          )}
        />
        <Tab
          value={SideJobTabs.Found}
          label={t(
            'sideJobs.foundSideJobs',
            {
              ns: 'ui',
              active: activeSideJobsCount,
              total: gameStateManager.sideJobState.sideJobs.length,
            },
          )}
        />
      </Tabs>
    </Box>
  );
});

export default SideJobsTabsContainer;
