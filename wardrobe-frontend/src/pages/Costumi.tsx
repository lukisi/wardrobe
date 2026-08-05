import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Drawer,
  Fab,
  Grid,
  IconButton,
  Pagination,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { isAxiosError } from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CostumeCard from '../components/costumi/CostumeCard';
import CostumeDetailDialog from '../components/costumi/CostumeDetailDialog';
import CostumeFilters, {
  costumeFiltersToSearchParams,
  parseCostumeFiltersFromSearch,
  type CostumeFiltersState,
} from '../components/costumi/CostumeFilters';
import CostumeFormDialog, {
  type CostumeFormSubmit,
} from '../components/costumi/CostumeFormDialog';
import { PAGE_SIZE } from '../constants/costumi';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  createCostume,
  deleteCostume,
  deleteCostumeImage,
  fetchCostumi,
  fetchCostumiMeta,
  updateCostume,
  uploadCostumeImage,
} from '../services/costumi';
import type { Costume, CostumiMeta } from '../types';

function periodFilterReady(filters: CostumeFiltersState): boolean {
  if (filters.mode !== 'periodo') return false;
  if (!filters.dal || !filters.al) return false;
  return filters.al >= filters.dal;
}

export default function Costumi() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { filters, page } = useMemo(
    () => parseCostumeFiltersFromSearch(searchParams),
    [searchParams],
  );
  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [items, setItems] = useState<Costume[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [meta, setMeta] = useState<CostumiMeta | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Costume | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Costume | null>(null);
  const [deleting, setDeleting] = useState(false);

  const replaceSearch = useCallback(
    (nextFilters: CostumeFiltersState, nextPage: number) => {
      const next = costumeFiltersToSearchParams(nextFilters, nextPage);
      if (next.toString() === searchParams.toString()) return;
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const loadMeta = useCallback(async () => {
    try {
      const data = await fetchCostumiMeta();
      setMeta(data);
    } catch (err: unknown) {
      console.error('Errore meta costumi', err);
    }
  }, []);

  const loadList = useCallback(async () => {
    if (filters.mode === 'periodo' && !periodFilterReady(filters)) {
      setItems([]);
      setTotalCount(0);
      setFetching(false);
      return;
    }

    setFetching(true);
    setError(null);
    try {
      const data = await fetchCostumi({
        q: debouncedQ,
        categoria: filters.categoria,
        taglia: filters.taglia,
        dal: periodFilterReady(filters) ? filters.dal : undefined,
        al: periodFilterReady(filters) ? filters.al : undefined,
        page,
        page_size: PAGE_SIZE,
      });
      setItems(data.results);
      setTotalCount(data.count);
    } catch (err: unknown) {
      console.error('Errore fetch costumi', err);
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Sessione scaduta. Effettua nuovamente il login.');
      } else {
        setError('Errore nel caricamento dei costumi');
      }
    } finally {
      setFetching(false);
    }
  }, [
    debouncedQ,
    filters.categoria,
    filters.taglia,
    filters.mode,
    filters.dal,
    filters.al,
    page,
  ]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (costume: Costume) => {
    setDetailOpen(false);
    setEditing(costume);
    setFormOpen(true);
  };

  const handleFormSubmit = async ({ payload, imageFile, removeImage }: CostumeFormSubmit) => {
    let saved: Costume;
    if (editing) {
      saved = await updateCostume(editing.id, payload);
      if (removeImage) {
        await deleteCostumeImage(saved.id);
        saved = { ...saved, has_immagine: false };
      }
    } else {
      saved = await createCostume(payload);
    }

    if (imageFile) {
      saved = await uploadCostumeImage(saved.id, imageFile);
    }

    setSelected(saved);
    await Promise.all([loadList(), loadMeta()]);
  };

  const handleDelete = async (costume: Costume) => {
    if (!window.confirm(`Eliminare «${costume.nome}»?`)) return;
    setDeleting(true);
    try {
      await deleteCostume(costume.id);
      setDetailOpen(false);
      setSelected(null);
      await Promise.all([loadList(), loadMeta()]);
    } catch (err: unknown) {
      console.error('Errore delete costume', err);
      setError("Impossibile eliminare il costume");
    } finally {
      setDeleting(false);
    }
  };

  const filtersPanel = (
    <CostumeFilters
      value={filters}
      meta={meta}
      onChange={(next) => {
        replaceSearch(next, 1);
      }}
    />
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 10 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            Database Costumi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cerca e gestisci i costumi dell&apos;inventario
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap sx={{ flexWrap: 'wrap' }}>
          {meta && (
            <Chip color="primary" variant="outlined" label={`${meta.totale} costumi`} />
          )}
          {!isMdUp && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen(true)}
            >
              Filtri
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {isMdUp && (
          <Grid size={{ md: 3 }}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                position: 'sticky',
                top: 88,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Filtri
              </Typography>
              {filtersPanel}
            </Box>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 9 }}>
          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Alert severity="info">
              {filters.mode === 'periodo' && !periodFilterReady(filters)
                ? 'Imposta Dal e Al per vedere i costumi disponibili nel periodo.'
                : 'Nessun costume trovato con i filtri selezionati.'}
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {totalCount} risultat{totalCount === 1 ? 'o' : 'i'}
              </Typography>
              <Grid container spacing={2.5}>
                {items.map((costume) => (
                  <Grid key={costume.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <CostumeCard
                      costume={costume}
                      onClick={(item) => {
                        setSelected(item);
                        setDetailOpen(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, value) => replaceSearch(filters, value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{ sx: { width: 300, p: 2.5 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Filtri</Typography>
          <IconButton aria-label="chiudi filtri" onClick={() => setFiltersOpen(false)}>
            <FilterListIcon />
          </IconButton>
        </Stack>
        {filtersPanel}
      </Drawer>

      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
        <Fab color="primary" aria-label="nuovo costume" onClick={handleOpenCreate}>
          <AddIcon />
        </Fab>
      </Box>

      <CostumeDetailDialog
        costume={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={(c) => void handleDelete(c)}
        onPrenota={(c) => {
          setDetailOpen(false);
          const params = new URLSearchParams({ costume: String(c.id) });
          if (periodFilterReady(filters)) {
            params.set('dal', filters.dal);
            params.set('al', filters.al);
          }
          navigate(`/prenotazioni?${params.toString()}`);
        }}
        deleting={deleting}
      />

      <CostumeFormDialog
        open={formOpen}
        costume={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
}
