import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent, AlertComponent, AreaChartComponent, AvatarComponent, AvatarGroupComponent,
  BadgeComponent, BarChartComponent, BreadcrumbsComponent, ButtonComponent, CalloutComponent,
  CardComponent, CheckboxComponent, ChipComponent, ChoicePromptComponent, CodeBlockComponent,
  ContainerComponent, DescriptionListComponent, DiffViewerComponent, DividerComponent,
  DonutChartComponent, DrawerComponent, EmptyStateComponent, FooterComponent, FunnelChartComponent,
  GanttChartComponent, GaugeComponent, HeaderComponent, HeatmapComponent, HeroComponent,
  IconComponent, InputComponent, KanbanBoardComponent, LineChartComponent, ListComponent,
  LogoComponent, MarkdownComponent, MenuComponent, ModalComponent, NextStepCardComponent,
  NotificationCenterComponent, NumberInputComponent, PageHeaderComponent, PaginationComponent,
  PieChartComponent, PipelineComponent, ProgressBarComponent, ProgressRingComponent,
  RadarChartComponent, RatingComponent, ScatterPlotComponent, SectionComponent, SelectComponent,
  SkeletonComponent, SliderComponent, SparklineComponent, SpinnerComponent, StackComponent,
  StackedBarChartComponent, StageListComponent, StatTrendComponent, StatusDotComponent,
  StepperComponent, SwitchComponent, TabComponent, TabsComponent, TableComponent,
  TagInputComponent, TextareaComponent, TimelineComponent, ToggleGroupComponent,
  ToolbarComponent, TooltipDirective, TreeViewComponent, TypographyComponent,
  WaterfallChartComponent,
  type BreadcrumbItem, type ChoicePromptOption, type DescriptionListItem, type FooterSection,
  type GanttTask, type KanbanColumn, type ListItem, type Notification, type PipelineStep,
  type SelectOption, type StageItem, type StepperStep, type TableColumn, type TimelineItem,
  type ToggleOption, type TreeNode,
} from '@lifecorner/angular-ui-kit';
import { ButtonLinkComponent, type HeaderNavItem } from '@lifecorner/angular-ui-kit';
import {
  AppPageComponent, AppShellComponent, BottomNavComponent, CopyFieldComponent, ProviderButtonComponent,
  RadioComponent, RadioGroupComponent, type BottomNavItem,
} from '@lifecorner/angular-ui-kit';
import { Probe36 } from './probe-36';
import { Probe38 } from './probe-38';
import { Probe39 } from './probe-39';
import { Probe310 } from './probe-310';
import { Probe311 } from './probe-311';
import { Probe3112 } from './probe-3112';
import { Probe312 } from './probe-312';
import { Probe313 } from './probe-313';
import { Probe314 } from './probe-314';
import { Probe315 } from './probe-315';
import { Probe316 } from './probe-316';

/**
 * The broad page (route `''`): every component, imported from the PRIMARY
 * entry `@lifecorner/angular-ui-kit`, as consumers did before 3.5.
 */
@Component({
  selector: 'lc-compat-home',
  imports: [
    AccordionComponent, AlertComponent, AreaChartComponent, AvatarComponent, AvatarGroupComponent,
    BadgeComponent, BarChartComponent, BreadcrumbsComponent, ButtonComponent, CalloutComponent,
    CardComponent, CheckboxComponent, ChipComponent, ChoicePromptComponent, CodeBlockComponent,
    ContainerComponent, DescriptionListComponent, DiffViewerComponent, DividerComponent,
    DonutChartComponent, DrawerComponent, EmptyStateComponent, FooterComponent, FunnelChartComponent,
    GanttChartComponent, GaugeComponent, HeaderComponent, HeatmapComponent, HeroComponent,
    IconComponent, InputComponent, KanbanBoardComponent, LineChartComponent, ListComponent,
    LogoComponent, MarkdownComponent, MenuComponent, ModalComponent, NextStepCardComponent,
    NotificationCenterComponent, NumberInputComponent, PageHeaderComponent, PaginationComponent,
    PieChartComponent, PipelineComponent, ProgressBarComponent, ProgressRingComponent,
    RadarChartComponent, RatingComponent, ScatterPlotComponent, SectionComponent, SelectComponent,
    SkeletonComponent, SliderComponent, SparklineComponent, SpinnerComponent, StackComponent,
    StackedBarChartComponent, StageListComponent, StatTrendComponent, StatusDotComponent,
    StepperComponent, SwitchComponent, TabComponent, TabsComponent, TableComponent,
    TagInputComponent, TextareaComponent, TimelineComponent, ToggleGroupComponent,
    ToolbarComponent, TooltipDirective, TreeViewComponent, TypographyComponent,
    WaterfallChartComponent,
    ButtonLinkComponent,
    // 3.3
    AppPageComponent, AppShellComponent, BottomNavComponent, CopyFieldComponent, ProviderButtonComponent,
    RadioComponent, RadioGroupComponent,
    // 3.6 (request 002)
    Probe36,
    // 3.8 (request 005)
    Probe38,
    // 3.9 (request 006)
    Probe39,
    // 3.10 (request 008)
    Probe310,
    // 3.11.1 (request 011)
    Probe311,
    // 3.11.2 (request 012)
    Probe3112,
    // 3.12 (request 016)
    Probe312,
    // 3.13 (request 017)
    Probe313,
    // 3.14 (request 019)
    Probe314,
    // 3.15 (request 020)
    Probe315,
    // 3.16 (request 022)
    Probe316,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly checked = signal(true);
  protected readonly role = signal('member');
  protected readonly bottomNav: BottomNavItem[] = [
    { id: 'today', label: 'Heute', icon: 'home', route: '/' },
    { id: 'household', label: 'Haushalt', icon: 'users', route: '/household' },
  ];
  protected readonly volume = signal(40);
  protected readonly selectOptions: SelectOption[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  protected readonly toggleOptions: ToggleOption[] = [
    { value: 'day', label: 'Tag' },
    { value: 'week', label: 'Woche' },
  ];
  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'amount', label: 'Betrag' },
  ];
  protected readonly rows = [
    { name: 'Strom', amount: 82 },
    { name: 'Internet', amount: 39 },
  ];
  protected readonly listItems: ListItem[] = [{ id: '1', label: 'Vertrag', subtitle: 'läuft' }];
  protected readonly dlItems: DescriptionListItem[] = [{ term: 'Status', value: 'aktiv' }];
  protected readonly tree: TreeNode[] = [{ name: 'src', children: [{ name: 'main.ts' }] }];
  protected readonly timeline: TimelineItem[] = [{ title: 'Erstellt', state: 'success' }];
  protected readonly pipeline: PipelineStep[] = [
    { label: 'Plan', status: 'complete' },
    { label: 'Bau', status: 'current' },
    { label: 'Test', status: 'pending' },
  ];
  protected readonly steps: StepperStep[] = [{ label: 'Eins' }, { label: 'Zwei' }];
  protected readonly stages: StageItem[] = [{ label: 'Offen', value: 3 }];
  protected readonly kanban: KanbanColumn[] = [
    { id: 'todo', title: 'To do', cards: [{ id: 'c1', title: 'Karte', labels: [] }] },
  ];
  protected readonly notifications: Notification[] = [
    { id: 'n1', title: 'Hinweis', timestamp: new Date('2026-10-10T10:00:00Z') },
  ];
  protected readonly choices: ChoicePromptOption[] = [
    { id: 'yes', label: 'Ja', recommended: true },
    { id: 'no', label: 'Nein' },
  ];
  protected readonly gantt: GanttTask[] = [
    { id: 't1', title: 'Phase 0', start: '2026-10-01', end: '2026-10-20' },
  ];
  protected readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Start', url: '/' }, { label: 'Seite' }];
  protected readonly footerSections: FooterSection[] = [
    { title: 'Seiten', links: [{ label: 'Sicherheit', href: '/de/sicherheit', current: true }] },
    { title: 'Mitverfolgen', links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/', rel: 'me' }] },
  ];
  protected readonly navItems: HeaderNavItem[] = [
    { label: 'Sicherheit', href: '/de/sicherheit', current: true },
    { label: 'Roadmap', href: '/de/roadmap' },
  ];
  protected readonly markdown = 'Ein [Link](https://example.org) in **Fließtext** mit Vermittlungsprämien.';
}
