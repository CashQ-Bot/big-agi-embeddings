import * as React from 'react';
import { shallow } from 'zustand/shallow';
import { useQuery } from '@tanstack/react-query';

import { Box, CircularProgress, FormControl, FormHelperText, FormLabel, IconButton, Input, Option, Select, Slider, Stack, Tooltip } from '@mui/joy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { Section } from '@/common/components/Section';
import { settingsGap } from '@/common/theme';
import { useSettingsStore } from '@/common/state/store-settings';

import { Embeddings } from './embeddings.types';
import {
  isValidDatabaseUrl,
  embeddingsDefaultIndex,
  embeddingsDefaultDocCount,
  embeddingsDefaultChainType,
  requireUserKeyEmbeddings,
} from './embeddings.client';
import {prodiaDefaultModelId} from "@/modules/prodia/prodia.client";


export function EmbeddingsSettings() {
  // state
  const [showApiKeyValue, setShowApiKeyValue] = React.useState(false);

  // external state
  const { apiKey, setApiKey, index, setIndex, docsCount, setDocsCount,chainType,setChainType} = useSettingsStore(state => ({
    apiKey: state.embeddingsApiKey, setApiKey: state.setEmbeddingsApiKey,
    index: state.embeddingsIndex, setIndex: state.setEmbeddingsIndex,
    docsCount: state.embeddingsDocs, setDocsCount: state.setEmbeddingsDocs,
    chainType: state.embeddingsChainType, setChainType: state.setEmbeddingsChainType,
  }), shallow);

  const requiresKey = requireUserKeyEmbeddings;
  const isValidKey = apiKey ? isValidDatabaseUrl(apiKey) : !requiresKey;

  const handleToggleApiKeyVisibility = () => setShowApiKeyValue(!showApiKeyValue);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value);

  const handleChainTypeChange = (e: any, value: string | null) => value && setChainType(value);

  const colWidth = 150;

  const chainTypes = ['stuff', 'map_reduce', 'refine', 'map_rerank'];

  return (
    <Section title='📚 OpenAi Embeddings' collapsible collapsed disclaimer='Supported vector database: Redis' sx={{ mt: 2 }}>
      <Stack direction='column' sx={{ gap: settingsGap, mt: -0.8 }}>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <FormLabel sx={{ minWidth: colWidth }}>
              Pinecone API Key
            </FormLabel>
            <FormHelperText>
              {requiresKey ? '(required)' : '(optional)'}
            </FormHelperText>
          </Box>
          <Input
            variant='outlined' type={showApiKeyValue ? 'text' : 'password'} placeholder={requiresKey ? 'required' : '...'} error={!isValidKey}
            value={apiKey} onChange={handleApiKeyChange}
            startDecorator={<KeyIcon />}
            endDecorator={!!apiKey && (
              <IconButton variant='plain' color='neutral' onClick={handleToggleApiKeyVisibility}>
                {showApiKeyValue ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            )}
            slotProps={{ input: { sx: { width: '100%' } } }}
            sx={{ width: '100%' }}
          />
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Tooltip title='Pinecone index name'>
              <FormLabel sx={{ minWidth: colWidth }}>
                Index name <InfoOutlinedIcon sx={{ mx: 0.5 }} />
              </FormLabel>
            </Tooltip>
            <FormHelperText>
              {index ? '' : ''}
            </FormHelperText>
          </Box>
          <Input
            aria-label='Index name'
            variant='outlined' placeholder=''
            value={index || embeddingsDefaultIndex} onChange={(e) => setIndex(e.target.value)}
            slotProps={{ input: { sx: { width: '100%' } } }}
            sx={{ width: '100%' }}
          />
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Tooltip title='The number of documents to return from database'>
              <FormLabel sx={{ minWidth: colWidth }}>
                Docs count <InfoOutlinedIcon sx={{ mx: 0.5 }} />
              </FormLabel>
            </Tooltip>
            <FormHelperText>
              {docsCount ? '' : ''}
            </FormHelperText>
          </Box>
          <Input
            aria-label='Docs count for search'
            variant='outlined' placeholder=''
            value={docsCount || embeddingsDefaultDocCount} onChange={(e) => setDocsCount(e.target.value as unknown as number)}
            slotProps={{
              input: {
                type: 'number',
                sx: { width: '100%' },
              },
            }}
            sx={{ width: '100%' }}
          />
        </FormControl>

        <FormControl orientation='horizontal' sx={{ justifyContent: 'space-between' }}>
          <FormLabel sx={{ minWidth: colWidth }}>
            Chain type
          </FormLabel>
          <Select
              variant='outlined' placeholder={isValidKey ? 'Select a model' : 'Enter API Key'}
              value={chainType || embeddingsDefaultChainType} onChange={handleChainTypeChange}

              indicator={<KeyboardArrowDownIcon />}
              slotProps={{
                root: { sx: { width: '100%' } },
                indicator: { sx: { opacity: 0.5 } },
              }}
          >
            <Option key={'chain-type-none'} value='none'>none</Option>
            {chainTypes?.map((chain, idx) => (
                <Option key={'chain-type-' + idx} value={chain}>
                  {chain}
                </Option>
            ))}
          </Select>
        </FormControl>

      </Stack>
    </Section>
  );
}